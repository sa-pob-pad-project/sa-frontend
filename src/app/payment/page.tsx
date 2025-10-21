import { redirect } from "next/navigation"

export default function PaymentPage() {
  redirect("/order?step=payment")
}

