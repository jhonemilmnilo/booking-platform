import { toast } from "sonner"
import { CheckCircle2, AlertTriangle, Info, XCircle } from "lucide-react"

export const showToast = {
  success: (message: string, description?: string) => {
    toast.custom(() => (
      <div className="flex w-full max-w-sm gap-3 rounded-xl border border-emerald-500 bg-white dark:bg-zinc-950 p-4 shadow-lg text-zinc-900 dark:text-zinc-100 animate-in fade-in slide-in-from-top-4 duration-300">
        <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
        <div className="flex flex-col gap-0.5 text-left">
          <h4 className="text-xs font-bold text-zinc-800 dark:text-zinc-200">{message}</h4>
          {description && <p className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 leading-normal">{description}</p>}
        </div>
      </div>
    ))
  },
  error: (message: string, description?: string) => {
    toast.custom(() => (
      <div className="flex w-full max-w-sm gap-3 rounded-xl border border-red-500 bg-white dark:bg-zinc-950 p-4 shadow-lg text-zinc-900 dark:text-zinc-100 animate-in fade-in slide-in-from-top-4 duration-300">
        <XCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
        <div className="flex flex-col gap-0.5 text-left">
          <h4 className="text-xs font-bold text-zinc-800 dark:text-zinc-200">{message}</h4>
          {description && <p className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 leading-normal">{description}</p>}
        </div>
      </div>
    ))
  },
  info: (message: string, description?: string) => {
    toast.custom(() => (
      <div className="flex w-full max-w-sm gap-3 rounded-xl border border-cyan-500 bg-white dark:bg-zinc-950 p-4 shadow-lg text-zinc-900 dark:text-zinc-100 animate-in fade-in slide-in-from-top-4 duration-300">
        <Info className="h-5 w-5 text-cyan-500 shrink-0 mt-0.5" />
        <div className="flex flex-col gap-0.5 text-left">
          <h4 className="text-xs font-bold text-zinc-800 dark:text-zinc-200">{message}</h4>
          {description && <p className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 leading-normal">{description}</p>}
        </div>
      </div>
    ))
  },
  warning: (message: string, description?: string) => {
    toast.custom(() => (
      <div className="flex w-full max-w-sm gap-3 rounded-xl border border-amber-500 bg-white dark:bg-zinc-950 p-4 shadow-lg text-zinc-900 dark:text-zinc-100 animate-in fade-in slide-in-from-top-4 duration-300">
        <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
        <div className="flex flex-col gap-0.5 text-left">
          <h4 className="text-xs font-bold text-zinc-800 dark:text-zinc-200">{message}</h4>
          {description && <p className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 leading-normal">{description}</p>}
        </div>
      </div>
    ))
  }
}
