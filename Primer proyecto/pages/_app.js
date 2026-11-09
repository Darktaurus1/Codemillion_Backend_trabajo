import Menu from "../components/Menu";
import { SesionProvider } from "../context/SesionContext";
import '../styles/styles.css';

export default function App ({Component, pageProps}){
    return (
        
        <SesionProvider>
            <Menu />
            <Component {...pageProps}/>
        </SesionProvider>
    );
}