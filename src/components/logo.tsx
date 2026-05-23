import Link from "next/link";

type LogoProps = {
  href?: string;
};

export function Logo({ href = "/" }: LogoProps) {
  return (
    <Link href={href} className="text-xl font-semibold tracking-tight">
      Leads<span className="text-accent">fy</span>
    </Link>
  );
}
