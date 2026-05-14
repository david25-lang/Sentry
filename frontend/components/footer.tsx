import Link from "next/link";

const technologies = [
  "YOLOv8",
  "CNN",
  "Next.js",
  "Tailwind CSS",
  "Framer Motion",
  "Recharts",
];

export function Footer() {
  return (
    <footer className="mt-16 border-t border-white/10 py-10 text-sm text-zinc-400">
      <div className="grid gap-8 lg:grid-cols-3">
        <div>
          <p className="text-white">Sentry AI</p>
          <p className="mt-2 text-xs text-zinc-500">
            Final Year Project — Pothole and Crack Detection System.
          </p>
        </div>
        <div>
          <p className="text-white">Technologies</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {technologies.map((tech) => (
              <span key={tech} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs">
                {tech}
              </span>
            ))}
          </div>
        </div>
        <div>
          <p className="text-white">Contact</p>
          <p className="mt-2 text-xs">sentry-ai@university.edu</p>
          <Link href="#" className="mt-2 inline-block text-xs text-orange-300">
            GitHub Repository
          </Link>
        </div>
      </div>
    </footer>
  );
}
