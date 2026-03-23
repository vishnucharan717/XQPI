import SideNav from "@/app/ui/dashboard/sidenav";

export default function Layout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex flex-col md:flex-row md:overflow-hidden lg:overflow-hidden">
          <div className="w-full flex-none md:w-64">
            <SideNav />
          </div>
          <div className="h-screen flex-grow p-6 overflow-y-scroll md:pt-2 md:pl-2 md:pr-2 pb-14">{children}</div>
        </div>
      );
}