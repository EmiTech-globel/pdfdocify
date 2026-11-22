const points = ['Re-download your PDFs any time', 'Get free updates for guides you own', 'Track your orders in one place']

export default function AuthShell({children}: {children: React.ReactNode}) {
  return (
    <div className="mx-auto flex w-full max-w-[1000px] flex-wrap px-5 pb-[72px] pt-10 sm:px-8 sm:pt-16">
      <div className="flex flex-[1_1_320px] flex-col justify-center gap-5 rounded-t-[20px] bg-accent p-8 text-white sm:p-11 md:rounded-l-[20px] md:rounded-tr-none">
        <h2 className="font-heading text-[30px] font-bold leading-[1.1]">Your guides, always with you</h2>
        <ul className="m-0 flex list-none flex-col gap-3 p-0 text-base">
          {points.map((p) => <li key={p}>{p}</li>)}
        </ul>
      </div>
      <div className="flex flex-[1_1_380px] items-center justify-center rounded-b-[20px] bg-card p-8 sm:p-11 md:rounded-r-[20px] md:rounded-bl-none">{children}</div>
    </div>
  )
}
