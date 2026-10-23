import { DevConfigNotice } from './components/DevConfigNotice'
import { Footer } from './components/layout/Footer'
import { Header } from './components/layout/Header'
import { Categories } from './sections/Categories'
import { ContactCta } from './sections/ContactCta'
import { Differentials } from './sections/Differentials'
import { Faq } from './sections/Faq'
import { Gallery } from './sections/Gallery'
import { Hero } from './sections/Hero'
import { Process } from './sections/Process'

export default function App() {
  return (
    <>
      <a className="skip-link" href="#contenido">
        Saltar al contenido
      </a>
      <Header page="home" />
      <main id="contenido">
        <Hero />
        <Categories />
        <Gallery />
        <Process />
        <Differentials />
        <Faq />
        <ContactCta />
      </main>
      <Footer />
      <DevConfigNotice />
    </>
  )
}
