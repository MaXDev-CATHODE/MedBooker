import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import Home from './pages/Home';
import NewPatient from './pages/NewPatient';
import OwnerPatient from './pages/OwnerPatient';
import TeamPatient from './pages/TeamPatient';
import MockTpay from './pages/MockTpay';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentError from './pages/PaymentError';
import Architecture from './pages/Architecture';
import ExitPopup from './components/ExitPopup';
import DemoPanel from './components/DemoPanel';
import ToastContainer from './components/ToastContainer';

function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <ToastProvider>
        {/* Global overlays — visible on all pages */}
        <ExitPopup />
        <DemoPanel />
        <ToastContainer />

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/new-patient" element={<NewPatient />} />
          <Route path="/owner-patient" element={<OwnerPatient />} />
          <Route path="/team-patient" element={<TeamPatient />} />
          <Route path="/mock-payment" element={<MockTpay />} />
          <Route path="/payment/success" element={<PaymentSuccess />} />
          <Route path="/payment/error" element={<PaymentError />} />
          <Route path="/architecture" element={<Architecture />} />
        </Routes>
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;
