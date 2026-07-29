export default function Hero({ settings }) {
  const heading = settings?.content?.heading || "Welcome to the Milan Student Network";
  const body =
    settings?.content?.body ||
    "Write a description of what Milan Student Network is from the admin dashboard.";
  const bgImage = settings?.background_image_url;

  return (
    <section
      className="relative flex min-h-[420px] items-center justify-center bg-slate-900 bg-cover bg-center px-6 text-center"
      style={bgImage ? { backgroundImage: `url(${bgImage})` } : undefined}
    >
      {bgImage && <div className="absolute inset-0 bg-slate-900/60" />}
      <div className="relative max-w-2xl">
        <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
          {heading}
        </h1>
        <p className="mt-4 whitespace-pre-line text-lg text-slate-200">{body}</p>
      </div>
    </section>
  );
}
