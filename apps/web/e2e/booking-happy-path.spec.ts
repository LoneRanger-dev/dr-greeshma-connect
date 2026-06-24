import { test, expect, type Page, type Route } from "@playwright/test";

// ── Shared fixture data ────────────────────────────────────────────────────

const API = "http://localhost:4000";

const MOCK_SERVICE = {
  id:          "svc-preg",
  title:       "Pregnancy Consultation",
  slug:        "pregnancy-consultation",
  durationMin: 60,
  priceInr:    1200,
  isActive:    true,
  description: "Expert antenatal care from first trimester through delivery.",
};

const MOCK_DOCTOR_ID = "doc-001";

const TODAY = new Date();
// Pick a date ~7 days out so it's likely available
const FUTURE = new Date(TODAY);
FUTURE.setDate(TODAY.getDate() + 7);
const FUTURE_DATE = FUTURE.toISOString().slice(0, 10); // YYYY-MM-DD

const MOCK_APPOINTMENT = {
  id:          "appt-001",
  status:      "CONFIRMED",
  startsAt:    `${FUTURE_DATE}T09:00:00.000Z`,
  endsAt:      `${FUTURE_DATE}T10:00:00.000Z`,
  meetLink:    "https://meet.google.com/test-meet-link",
  patientName: "Priya Sharma",
  service:     MOCK_SERVICE,
  doctor: {
    id:   MOCK_DOCTOR_ID,
    user: { name: "Dr. Greeshma Gopinath" },
  },
};

// ── Mock API helper ────────────────────────────────────────────────────────

async function mockAllApiRoutes(page: Page) {
  // GET /services
  await page.route(`${API}/services*`, (route: Route) =>
    route.fulfill({ json: { data: [MOCK_SERVICE] } }),
  );

  // GET /doctor
  await page.route(`${API}/doctor*`, (route: Route) =>
    route.fulfill({ json: { data: { doctorId: MOCK_DOCTOR_ID } } }),
  );

  // GET /slots/availability
  await page.route(`${API}/slots/availability*`, (route: Route) =>
    route.fulfill({ json: { data: [FUTURE_DATE] } }),
  );

  // GET /slots?date=...&serviceId=...
  await page.route(`${API}/slots*`, (route: Route) => {
    const url = new URL(route.request().url());
    if (url.pathname === "/slots") {
      return route.fulfill({
        json: {
          data: [
            { startsAt: `${FUTURE_DATE}T09:00:00.000Z`, endsAt: `${FUTURE_DATE}T10:00:00.000Z`, available: true },
            { startsAt: `${FUTURE_DATE}T11:00:00.000Z`, endsAt: `${FUTURE_DATE}T12:00:00.000Z`, available: true },
          ],
        },
      });
    }
    return route.continue();
  });

  // POST /auth/register
  await page.route(`${API}/auth/register`, (route: Route) =>
    route.fulfill({
      json: { data: { user: { id: "usr-001", email: "priya@test.com", role: "PATIENT" }, accessToken: "mock-jwt" } },
    }),
  );

  // POST /appointments
  await page.route(`${API}/appointments`, (route: Route) =>
    route.fulfill({ status: 201, json: { data: { id: "appt-001", status: "PENDING" } } }),
  );

  // POST /payments/order — return NOT_CONFIGURED so we skip Razorpay checkout
  await page.route(`${API}/payments/order`, (route: Route) =>
    route.fulfill({ status: 503, json: { error: "Razorpay not configured", code: "NOT_CONFIGURED" } }),
  );

  // GET /appointments/:id (confirmation page polling)
  await page.route(`${API}/appointments/appt-001*`, (route: Route) =>
    route.fulfill({ json: { data: MOCK_APPOINTMENT } }),
  );
}

// ── Tests ──────────────────────────────────────────────────────────────────

test.describe("Booking happy path", () => {
  test.beforeEach(async ({ page }) => {
    await mockAllApiRoutes(page);
  });

  test("navigates to /book and renders the service step", async ({ page }) => {
    await page.goto("/book");
    await expect(page.getByText(/what can we help you with/i)).toBeVisible();
    await expect(page.getByText("Pregnancy Consultation")).toBeVisible();
  });

  test("step 1 → step 2: selecting a service enables Continue", async ({ page }) => {
    await page.goto("/book");
    await page.getByText("Pregnancy Consultation").click();
    const continueBtn = page.getByRole("button", { name: /continue.*date/i });
    await expect(continueBtn).toBeEnabled();
    await continueBtn.click();
    await expect(page.getByText(/pick a date/i)).toBeVisible();
  });

  test("step 2 → step 3: picking a date shows time slots", async ({ page }) => {
    await page.goto("/book");
    // Select service
    await page.getByText("Pregnancy Consultation").click();
    await page.getByRole("button", { name: /continue.*date/i }).click();

    // The calendar should now be visible; click a highlighted (available) day
    await expect(page.getByText(/pick a date/i)).toBeVisible();
    // Available date button (uses aria-label containing the date)
    const dayBtn = page.locator("button[aria-label]").filter({
      hasText: FUTURE.getDate().toString(),
    }).first();
    await dayBtn.click();

    // Time slots section should appear
    await expect(page.getByText(/available times/i)).toBeVisible();
  });

  test("full wizard flow reaches confirmation page", async ({ page }) => {
    await page.goto("/book");

    // Step 1 — service
    await page.getByText("Pregnancy Consultation").click();
    await page.getByRole("button", { name: /continue.*date/i }).click();

    // Step 2 — date: click any available day button
    await page.waitForTimeout(500);
    const dayBtn = page.locator("button[aria-label]").filter({
      hasText: FUTURE.getDate().toString(),
    }).first();
    await dayBtn.click();

    // Step 3 — time slot: click first available slot
    await page.getByText(/09:00/i).first().click();
    await page.getByRole("button", { name: /continue.*details/i }).click();

    // Step 4 — details
    await page.getByPlaceholder(/jane doe/i).fill("Priya Sharma");
    await page.getByPlaceholder(/jane@example/i).fill("priya@test.com");
    await page.getByPlaceholder(/\+91/i).fill("9876543210");
    await page.getByPlaceholder(/create a password/i).fill("password123");
    await page.getByRole("button", { name: /review booking/i }).click();

    // Step 5 — review: confirm booking
    await expect(page.getByText(/confirm/i).first()).toBeVisible();
    await page.getByRole("button", { name: /confirm.*book/i }).click();

    // Should land on confirmation page
    await expect(page).toHaveURL(/\/book\/confirmation/);
    await expect(page.getByText(/booking confirmed/i)).toBeVisible({ timeout: 10_000 });
  });
});
