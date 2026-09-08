import { redirect } from "next/navigation"

// Cart and checkout merged into one page/step — see /checkout.
export default function CartPage() {
  redirect("/checkout")
}
