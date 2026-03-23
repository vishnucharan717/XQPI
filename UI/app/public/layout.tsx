import PublicSideNav from '@/app/ui/public/public-sidenav'

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col md:flex-row md:overflow-hidden lg:overflow-hidden">
      <div className=''>

      </div>
      {/* <div className="w-full md:w-64 flex-none">
        <PublicSideNav />
      </div> */}
      <div className="h-screen flex grow w-screen">{children}</div>
      <div className='flex md:hidden'>
      </div>
    </div>
  );
}