import { LoginForm } from "~/components/login-form"
import Link from "next/link"
import { FileTextIcon } from "lucide-react"

export default function Page() {
  return (
    <div 
      className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 bg-cover bg-center relative"
      style={{
        backgroundImage: "url('/assets/minecraft/backgrounds/Lobby.png')",
      }}
    >
      <div className="absolute top-6 left-6">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="size-8 rounded-sm bg-[#84cc16] flex items-center justify-center border border-[#365314] shadow-hud-outset">
            <FileTextIcon className="size-4.5 text-white" />
          </div>
          <span className="font-pixel font-bold text-xl tracking-wider text-white">
            FORMZ
          </span>
        </Link>
      </div>

      <div className="w-full max-w-sm relative z-10">
        <LoginForm />
      </div>
    </div>
  )
}
