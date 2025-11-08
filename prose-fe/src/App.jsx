import {StrictMode} from "react";
import {BrowserRouter} from "react-router-dom";
import {AuthProvider} from "./context/AuthContext.jsx";
import {CvProvider} from "./context/CvContext.jsx";
import {YearProvider} from "./context/YearContext.jsx";
import AppRoutes from "./AppRoutes.jsx";

function App() {
    return (
        <StrictMode>
            <BrowserRouter>
                <AuthProvider>
                    <CvProvider>
                        <YearProvider>
                            <AppRoutes />
                        </YearProvider>
                    </CvProvider>
                </AuthProvider>
            </BrowserRouter>
        </StrictMode>
    );
}

export default App;