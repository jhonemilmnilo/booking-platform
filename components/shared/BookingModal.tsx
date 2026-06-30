"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { format, differenceInDays } from "date-fns"
import { DateRange } from "react-day-picker"
import { toast } from "sonner"
import { CalendarIcon, Loader2, Sparkles } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FormField } from "@/components/ui/form-field"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Room } from "./RoomCard"
import { createBookingAction } from "@/app/actions/booking"

// Zod Validation Schema
const bookingClientSchema = z.object({
  guestName: z.string().min(2, "Name must be at least 2 characters"),
  guestEmail: z.string().email("Please enter a valid email address"),
  guestPhone: z.string().min(10, "Please enter a valid phone number (min 10 digits)"),
  dateRange: z.object({
    from: z.date({ message: "Check-in date is required" }),
    to: z.date({ message: "Check-out date is required" }),
  }),
})

type BookingClientForm = z.infer<typeof bookingClientSchema>

interface BookingModalProps {
  room: Room | null
  isOpen: boolean
  onClose: () => void
}

interface BookingSuccessData {
  reference: string
  roomName: string
  guestName: string
  nights: number
  pricePerNight: number
  totalPrice: number
  status: string
}

export default function BookingModal({ room, isOpen, onClose }: BookingModalProps) {
  const [isPending, startTransition] = React.useTransition()
  const [successData, setSuccessData] = React.useState<BookingSuccessData | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<BookingClientForm>({
    resolver: zodResolver(bookingClientSchema),
    defaultValues: {
      guestName: "",
      guestEmail: "",
      guestPhone: "",
      dateRange: {
        from: new Date(),
        to: undefined,
      },
    },
  })

  // Watch fields for dynamic receipt computation
  const dateRange = watch("dateRange")

  // Reset success state and form when modal is closed/opened
  React.useEffect(() => {
    if (isOpen) {
      setSuccessData(null)
      reset()
    }
  }, [isOpen, reset])

  const onSubmit = (values: BookingClientForm) => {
    if (!room) return

    startTransition(async () => {
      try {
        const response = await createBookingAction({
          roomId: room.id,
          guestName: values.guestName,
          guestEmail: values.guestEmail,
          guestPhone: values.guestPhone,
          checkIn: values.dateRange.from.toISOString(),
          checkOut: values.dateRange.to.toISOString(),
          guestsCount: 2, // Default to 2 for this modal
        })

        if (response.success && response.data) {
          setSuccessData(response.data)
          toast.success("Booking request confirmed!")
        } else {
          toast.error(response.error || "Something went wrong.")
        }
      } catch (err) {
        toast.error("Failed to submit request. Please try again.")
      }
    })
  }

  // Calculate live summary nights & cost
  const nights = dateRange?.from && dateRange?.to 
    ? differenceInDays(dateRange.to, dateRange.from) 
    : 0
  const estimatedCost = room ? room.pricePerNight * nights : 0

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[480px] bg-background border-border max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            {successData ? "Reservation Success" : "Request Reservation"}
            {successData && <Sparkles className="h-5 w-5 text-accent animate-pulse" />}
          </DialogTitle>
        </DialogHeader>

        {successData ? (
          // Success State Receipt
          <div className="flex flex-col gap-6 py-4">
            <div className="bg-primary/5 border border-primary/20 p-4 rounded-xl flex flex-col gap-2">
              <span className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">
                Booking Reference
              </span>
              <span className="text-xl font-mono font-bold text-primary">
                {successData.reference}
              </span>
            </div>

            <div className="flex flex-col gap-3">
              <h4 className="font-semibold text-foreground border-b border-border pb-2">
                Booking Summary
              </h4>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Guest Name:</span>
                <span className="font-medium">{successData.guestName}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Room:</span>
                <span className="font-medium">{successData.roomName}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Duration:</span>
                <span className="font-medium">{successData.nights} night(s)</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Rate:</span>
                <span className="font-medium">₱{successData.pricePerNight.toLocaleString()} / night</span>
              </div>
              <div className="flex justify-between text-base font-bold text-foreground border-t border-border pt-3 mt-1">
                <span>Total Calculated:</span>
                <span>₱{successData.totalPrice.toLocaleString()}</span>
              </div>
            </div>

            <Button onClick={onClose} className="w-full bg-primary hover:bg-primary/95 text-primary-foreground">
              Close Window
            </Button>
          </div>
        ) : (
          // Form State
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 py-2">
            {room && (
              <div className="border border-border/80 bg-muted/30 p-3 rounded-xl flex justify-between items-center">
                <div>
                  <h4 className="font-bold text-sm">{room.name}</h4>
                  <p className="text-xs text-muted-foreground">₱{room.pricePerNight.toLocaleString()} / night</p>
                </div>
                <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{room.size}</span>
              </div>
            )}

            {/* Guest Name */}
            <FormField label="Full Name" required error={errors.guestName?.message}>
              <Input
                {...register("guestName")}
                placeholder="Juan dela Cruz"
                disabled={isPending}
                className="h-10"
              />
            </FormField>

            {/* Guest Email */}
            <FormField label="Email Address" required error={errors.guestEmail?.message}>
              <Input
                {...register("guestEmail")}
                type="email"
                placeholder="juan@email.com"
                disabled={isPending}
                className="h-10"
              />
            </FormField>

            {/* Guest Phone */}
            <FormField label="Phone Number" required error={errors.guestPhone?.message}>
              <Input
                {...register("guestPhone")}
                placeholder="09171234567"
                disabled={isPending}
                className="h-10"
              />
            </FormField>

            {/* Date Range Picker inside form */}
            <FormField label="Stay Dates" required error={errors.dateRange?.from?.message || errors.dateRange?.to?.message}>
              <Popover>
                <PopoverTrigger
                  className="inline-flex items-center justify-start text-left font-normal h-10 border border-border bg-background text-foreground rounded-lg px-3 text-sm w-full cursor-pointer hover:bg-muted/30 outline-none transition-colors disabled:opacity-50 disabled:pointer-events-none"
                  disabled={isPending}
                >
                  <CalendarIcon className="mr-2 h-4 w-4 text-primary" />
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "LLL dd, yyyy")} -{" "}
                        {format(dateRange.to, "LLL dd, yyyy")}
                      </>
                    ) : (
                      format(dateRange.from, "LLL dd, yyyy")
                    )
                  ) : (
                    <span>Select Dates</span>
                  )}
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="range"
                    defaultMonth={dateRange?.from}
                    selected={dateRange}
                    onSelect={(val) => {
                      if (val) {
                        setValue("dateRange", {
                          from: val.from!,
                          to: val.to!,
                        }, { shouldValidate: true })
                      }
                    }}
                    numberOfMonths={1}
                    disabled={{ before: new Date() }}
                  />
                </PopoverContent>
              </Popover>
            </FormField>

            {/* Live Pricing Reciept Preview */}
            {nights > 0 && (
              <div className="bg-primary/5 border border-primary/20 p-4 rounded-xl flex flex-col gap-2">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>₱{room?.pricePerNight.toLocaleString()} × {nights} night(s)</span>
                  <span>₱{estimatedCost.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-foreground border-t border-border/60 pt-2">
                  <span>Estimated Total (PHP):</span>
                  <span>₱{estimatedCost.toLocaleString()}</span>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-3">
              <Button type="button" variant="ghost" onClick={onClose} disabled={isPending}>
                Cancel
              </Button>
              <Button type="submit" className="bg-primary hover:bg-primary/95 text-primary-foreground min-w-[120px]" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Confirm Request"
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
