import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"
import { Toaster } from "@/components/ui/sonner"
import { JourneyProvider } from "@/context/JourneyContext"
import BookingFlowLayout from "@/containers/BookingFlowLayout"
import SearchContainer from "@/containers/SearchContainer"
import SelectionContainer from "@/containers/SelectionContainer"
import PassengersContainer from "@/containers/PassengersContainer"
import ReviewContainer from "@/containers/ReviewContainer"
import PaymentContainer from "@/containers/PaymentContainer"
import ConfirmationContainer from "@/containers/ConfirmationContainer"

export default function App() {
  return (
    <JourneyProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<BookingFlowLayout />}>
            <Route path="/" element={<Navigate to="/buscar" replace />} />
            <Route path="/buscar" element={<SearchContainer />} />
            <Route path="/selecionar" element={<SelectionContainer />} />
            <Route path="/passageiros" element={<PassengersContainer />} />
            <Route path="/revisao" element={<ReviewContainer />} />
            <Route path="/pagamento" element={<PaymentContainer />} />
            <Route path="/confirmacao" element={<ConfirmationContainer />} />
            <Route path="*" element={<Navigate to="/buscar" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
      <Toaster />
    </JourneyProvider>
  )
}
