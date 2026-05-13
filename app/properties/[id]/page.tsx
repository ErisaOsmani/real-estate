import Link from "next/link"

export default async function PropertyDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return (
    <main className="min-h-screen">
      <section className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
        <Link href="/properties" className="text-sm text-amber-100 transition hover:text-amber-200">
          Kthehu te pronat
        </Link>

        <article className="rounded-3xl border border-white/10 bg-white/[0.06] p-6 sm:p-8">
          <p className="text-xs uppercase tracking-[0.32em] text-amber-200/80">
            Detaje prone
          </p>
          <h1 className="font-display mt-3 text-4xl text-white sm:text-5xl">
            Faqja e detajeve për `{id}`
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-white/62">
            Kjo është struktura fillestare për `/properties/[id]`. Në sprintet e ardhshme këtu do të shfaqen fotot, përshkrimi, çmimi, lokacioni, butoni për favorit dhe forma e kontaktit.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {["Galeria", "Informacionet", "Kontakt"].map((item) => (
              <div key={item} className="rounded-2xl border border-white/8 bg-black/20 p-5">
                <p className="text-lg text-white">{item}</p>
                <p className="mt-2 text-sm leading-6 text-white/55">
                  Placeholder për Sprintet 4-9.
                </p>
              </div>
            ))}
          </div>
        </article>
      </section>
    </main>
  )
}
