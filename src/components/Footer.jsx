export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50">
      <div className="mx-auto max-w-6xl px-6 py-8 text-sm text-slate-500">
        <p>&copy; {new Date().getFullYear()} Milan Student Network. All rights reserved.</p>
      </div>
    </footer>
  );
}
