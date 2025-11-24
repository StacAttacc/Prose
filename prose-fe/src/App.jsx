import {StrictMode} from "react";
import {BrowserRouter} from "react-router-dom";
import {AuthProvider} from "./context/AuthContext.jsx";
import {CvProvider} from "./context/CvContext.jsx";
import {YearProvider} from "./context/YearContext.jsx";
import {I18nProvider} from "./context/I18nContext.jsx";
import {ThemeProvider} from "./context/ThemeContext.jsx";
import AppRoutes from "./AppRoutes.jsx";

function App() {
    return (
        <StrictMode>
            <BrowserRouter>
                <ThemeProvider>
                    <I18nProvider>
                        <AuthProvider>
                            <CvProvider>
                                <YearProvider>
                                    <AppRoutes />
                                </YearProvider>
                            </CvProvider>
                        </AuthProvider>
                    </I18nProvider>
                </ThemeProvider>
            </BrowserRouter>
        </StrictMode>
    );
}

export default App;