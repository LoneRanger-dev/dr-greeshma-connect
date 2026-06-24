import { Navbar } from "@/components/sections/Navbar";

export default function BookingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-16">{children}</main>
    </div>
  );
}
