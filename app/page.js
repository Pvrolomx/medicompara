'use client'
import { useState, useEffect } from 'react'

// Función de similitud para tolerancia a typos
const similarity = (s1, s2) => {
  s1 = s1.toLowerCase()
  s2 = s2.toLowerCase()
  if (s1 === s2) return 1
  if (s1.length < 2 || s2.length < 2) return 0
  let matches = 0
  for (let i = 0; i < s1.length - 1; i++) {
    if (s2.includes(s1.substring(i, i + 2))) matches++
  }
  return (2 * matches) / (s1.length + s2.length - 2)
}



// Base de datos de medicamentos MVP
const medicamentos = [
  { usa: 'Lipitor', mx: 'Atorvastatina', dosis: '20mg', precioSimilares: 85, precioGuadalajara: 110, precioAhorro: 95, precioBenavides: 120, precioUSA: 350 },
  { usa: 'Metformin', mx: 'Metformina', dosis: '850mg', precioSimilares: 45, precioGuadalajara: 65, precioAhorro: 55, precioBenavides: 70, precioUSA: 180 },
  { usa: 'Lisinopril', mx: 'Lisinopril', dosis: '10mg', precioSimilares: 65, precioGuadalajara: 85, precioAhorro: 75, precioBenavides: 90, precioUSA: 220 },
  { usa: 'Omeprazole', mx: 'Omeprazol', dosis: '20mg', precioSimilares: 55, precioGuadalajara: 75, precioAhorro: 65, precioBenavides: 80, precioUSA: 150 },
  { usa: 'Amlodipine', mx: 'Amlodipino', dosis: '5mg', precioSimilares: 50, precioGuadalajara: 70, precioAhorro: 60, precioBenavides: 75, precioUSA: 190 },
  { usa: 'Losartan', mx: 'Losartán', dosis: '50mg', precioSimilares: 70, precioGuadalajara: 95, precioAhorro: 85, precioBenavides: 100, precioUSA: 280 },
  { usa: 'Simvastatin', mx: 'Simvastatina', dosis: '20mg', precioSimilares: 75, precioGuadalajara: 100, precioAhorro: 90, precioBenavides: 105, precioUSA: 320 },
  { usa: 'Levothyroxine', mx: 'Levotiroxina', dosis: '50mcg', precioSimilares: 40, precioGuadalajara: 55, precioAhorro: 48, precioBenavides: 60, precioUSA: 120 },
  { usa: 'Gabapentin', mx: 'Gabapentina', dosis: '300mg', precioSimilares: 95, precioGuadalajara: 125, precioAhorro: 110, precioBenavides: 130, precioUSA: 400 },
  { usa: 'Hydrochlorothiazide', mx: 'Hidroclorotiazida', dosis: '25mg', precioSimilares: 35, precioGuadalajara: 50, precioAhorro: 42, precioBenavides: 55, precioUSA: 95 },
  { usa: 'Atorvastatin', mx: 'Atorvastatina', dosis: '10mg', precioSimilares: 75, precioGuadalajara: 100, precioAhorro: 88, precioBenavides: 110, precioUSA: 300 },
  { usa: 'Pantoprazole', mx: 'Pantoprazol', dosis: '40mg', precioSimilares: 60, precioGuadalajara: 80, precioAhorro: 70, precioBenavides: 85, precioUSA: 160 },
  { usa: 'Metoprolol', mx: 'Metoprolol', dosis: '50mg', precioSimilares: 55, precioGuadalajara: 75, precioAhorro: 65, precioBenavides: 80, precioUSA: 140 },
  { usa: 'Prednisone', mx: 'Prednisona', dosis: '10mg', precioSimilares: 30, precioGuadalajara: 45, precioAhorro: 38, precioBenavides: 50, precioUSA: 80 },
  { usa: 'Furosemide', mx: 'Furosemida', dosis: '40mg', precioSimilares: 35, precioGuadalajara: 50, precioAhorro: 42, precioBenavides: 55, precioUSA: 90 },
]

// Farmacias cercanas (ejemplo Puerto Vallarta)
const farmacias = [
  { nombre: 'Farmacias Similares', direccion: 'Av. México 1234, Centro', distancia: '0.3 km', tel: '322-123-4567', lat: 20.6534, lng: -105.2253 },
  { nombre: 'Farmacias Guadalajara', direccion: 'Blvd. Francisco M. Ascencio 2456', distancia: '0.8 km', tel: '322-234-5678', lat: 20.6612, lng: -105.2341 },
  { nombre: 'Farmacias del Ahorro', direccion: 'Av. Fluvial Vallarta 890', distancia: '1.2 km', tel: '322-345-6789', lat: 20.6701, lng: -105.2412 },
  { nombre: 'Farmacia Benavides', direccion: 'Plaza Marina, Local 12', distancia: '1.5 km', tel: '322-456-7890', lat: 20.6489, lng: -105.2189 },
]

export default function Home() {
  const [screen, setScreen] = useState('home')
  const [search, setSearch] = useState('')
  const [resultado, setResultado] = useState(null)
  const [miLista, setMiLista] = useState([])
  const [lang, setLang] = useState('es')
  const [modoFarmacia, setModoFarmacia] = useState(null)
  const [recientes, setRecientes] = useState([])
  const [ubicacion, setUbicacion] = useState(null)
  const [farmaciasReales, setFarmaciasReales] = useState([])
  const [cargandoFarmacias, setCargandoFarmacias] = useState(false)
  const [errorUbicacion, setErrorUbicacion] = useState(null)

  // Cargar datos del localStorage
  useEffect(() => {
    const saved = localStorage.getItem('medicompara-lista')
    if (saved) setMiLista(JSON.parse(saved))
    const rec = localStorage.getItem('medicompara-recientes')
    if (rec) setRecientes(JSON.parse(rec))
  }, [])

  // Guardar lista
  useEffect(() => {
    localStorage.setItem('medicompara-lista', JSON.stringify(miLista))
  }, [miLista])

  // Obtener ubicación del usuario
  const obtenerUbicacion = () => {
    setCargandoFarmacias(true)
    setErrorUbicacion(null)
    
    if (!navigator.geolocation) {
      setErrorUbicacion(lang === 'es' ? 'Tu navegador no soporta geolocalización' : 'Your browser does not support geolocation')
      setCargandoFarmacias(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const loc = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        }
        setUbicacion(loc)
        buscarFarmaciasReales(loc)
      },
      (error) => {
        console.error('Error de ubicación:', error)
        setErrorUbicacion(lang === 'es' ? 'No pudimos obtener tu ubicación' : 'Could not get your location')
        setCargandoFarmacias(false)
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  // Buscar farmacias cercanas con Google Places API
  const buscarFarmaciasReales = (loc) => {
    if (typeof google === 'undefined' || !google.maps) {
      console.error('Google Maps no cargado')
      setCargandoFarmacias(false)
      return
    }

    const service = new google.maps.places.PlacesService(document.createElement('div'))
    
    const request = {
      location: new google.maps.LatLng(loc.lat, loc.lng),
      radius: 5000, // 5km
      type: 'pharmacy',
      keyword: 'farmacia'
    }

    service.nearbySearch(request, (results, status) => {
      if (status === google.maps.places.PlacesServiceStatus.OK && results) {
        const farmaciasConDistancia = results.slice(0, 6).map(place => {
          const distancia = calcularDistancia(loc.lat, loc.lng, place.geometry.location.lat(), place.geometry.location.lng())
          return {
            nombre: place.name,
            direccion: place.vicinity || 'Dirección no disponible',
            distancia: distancia < 1 ? (distancia * 1000).toFixed(0) + ' m' : distancia.toFixed(1) + ' km',
            distanciaNum: distancia,
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
            rating: place.rating || null,
            placeId: place.place_id
          }
        }).sort((a, b) => a.distanciaNum - b.distanciaNum)
        
        setFarmaciasReales(farmaciasConDistancia)
      } else {
        console.error('Error buscando farmacias:', status)
      }
      setCargandoFarmacias(false)
    })
  }

  // Calcular distancia entre dos puntos (Haversine)
  const calcularDistancia = (lat1, lon1, lat2, lon2) => {
    const R = 6371 // km
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return R * c
  }

  // Abrir en Google Maps
  const abrirMaps = (farmacia) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${farmacia.lat},${farmacia.lng}`
    window.open(url, '_blank')
  }



  // Buscar medicamento con tolerancia a typos
  const buscar = (query) => {
    const q = query.toLowerCase().trim()
    // Búsqueda exacta primero
    let found = medicamentos.find(m => 
      m.usa.toLowerCase().includes(q) || 
      m.mx.toLowerCase().includes(q)
    )
    // Si no encuentra, buscar con fuzzy matching
    if (!found && q.length >= 3) {
      let bestMatch = null
      let bestScore = 0
      medicamentos.forEach(m => {
        const scoreUsa = similarity(q, m.usa)
        const scoreMx = similarity(q, m.mx)
        const maxScore = Math.max(scoreUsa, scoreMx)
        if (maxScore > bestScore && maxScore > 0.4) {
          bestScore = maxScore
          bestMatch = m
        }
      })
      found = bestMatch
    }
    if (found) {
      setResultado(found)
      setScreen('resultado')
      // Guardar en recientes
      const newRecientes = [found.usa, ...recientes.filter(r => r !== found.usa)].slice(0, 5)
      setRecientes(newRecientes)
      localStorage.setItem('medicompara-recientes', JSON.stringify(newRecientes))
    } else {
      setResultado(null)
      alert(lang === 'es' ? 'Medicamento no encontrado' : 'Medicine not found')
    }
  }

  // Agregar a mi lista
  const agregarLista = (med) => {
    if (!miLista.find(m => m.usa === med.usa)) {
      setMiLista([...miLista, med])
    }
  }

  // Quitar de lista
  const quitarLista = (usa) => {
    setMiLista(miLista.filter(m => m.usa !== usa))
  }

  // Calcular ahorro total
  const calcularAhorro = () => {
    return miLista.reduce((acc, m) => acc + (m.precioUSA - m.precioSimilares), 0)
  }

  // Textos bilingües
  const t = {
    es: {
      buscar: 'Buscar medicina...',
      tuMedicina: 'Tu medicina gringa al mejor precio en México',
      recientes: 'Recientes',
      misMedicinas: 'Mis Medicinas',
      farmacias: 'Farmacias Cerca',
      enMexico: 'En México pide:',
      escuchar: 'Escuchar',
      copiar: 'Copiar',
      mismoIngrediente: 'Mismo ingrediente activo',
      aprobado: 'Aprobado por COFEPRIS',
      precios: 'Precios aproximados:',
      ahorras: 'Ahorras',
      modoFarmacia: 'MODO FARMACIA',
      guardar: 'Guardar en mi lista',
      muestreAlFarmaceutico: 'Muestre esta pantalla al farmacéutico',
      cerrar: 'Cerrar',
      tuBusqueda: 'Tu búsqueda:',
      ahorro: 'Ahorro total estimado:',
      quitar: 'Quitar',
      verPrecios: 'Ver precios',
      navegar: 'Navegar',
      llamar: 'Llamar',
    },
    en: {
      buscar: 'Search medicine...',
      tuMedicina: 'Your American medicine, best price in Mexico',
      recientes: 'Recent',
      misMedicinas: 'My Medicines',
      farmacias: 'Nearby Pharmacies',
      enMexico: 'In Mexico ask for:',
      escuchar: 'Listen',
      copiar: 'Copy',
      mismoIngrediente: 'Same active ingredient',
      aprobado: 'Approved by COFEPRIS',
      precios: 'Approximate prices:',
      ahorras: 'You save',
      modoFarmacia: 'PHARMACY MODE',
      guardar: 'Save to my list',
      muestreAlFarmaceutico: 'Show this screen to the pharmacist',
      cerrar: 'Close',
      tuBusqueda: 'Your search:',
      ahorro: 'Estimated total savings:',
      quitar: 'Remove',
      verPrecios: 'See prices',
      navegar: 'Navigate',
      llamar: 'Call',
    }
  }[lang]

  // MODO FARMACIA FULLSCREEN
  if (modoFarmacia) {
    return (
      <div className="fixed inset-0 bg-white flex flex-col items-center justify-center p-8 z-50">
        <div className="text-center">
          <p className="text-6xl md:text-8xl font-bold text-gray-900 mb-4">{modoFarmacia.mx}</p>
          <p className="text-xl md:text-lg md:text-2xl md:text-5xl text-gray-700 mb-8">{modoFarmacia.dosis}</p>
          <div className="border-t-2 border-gray-300 pt-8 mt-8">
            <p className="text-xl md:text-lg md:text-2xl text-gray-600 mb-4">Caja de 30</p>
          </div>
        </div>
        <div className="mt-auto">
          <div className="bg-farmacia/10 rounded-xl p-4 mb-6 text-center">
            <p className="text-xl md:text-lg md:text-2xl text-farmacia font-medium">📱 {t.muestreAlFarmaceutico}</p>
          </div>
          <button
            onClick={() => setModoFarmacia(null)}
            className="w-full py-4 text-xl md:text-lg md:text-2xl text-gray-600 border-2 border-gray-300 rounded-full"
          >
            ✕ {t.cerrar}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header con toggle de idioma */}
      <div className="fixed top-0 right-0 z-40 p-3">
        <button
          onClick={() => setLang(lang === 'es' ? 'en' : 'es')}
          className="text-base px-4 py-2 rounded-full bg-white/20 backdrop-blur text-white hover:bg-white/30 transition shadow-lg"
        >
          {lang === 'es' ? '🇺🇸 EN' : '🇲🇽 ES'}
        </button>
      </div>

      {/* Main content */}
      <main className="flex-1 pt-4 pb-20">
        
        {/* HOME SCREEN */}
        {screen === 'home' && (
          <div className="relative min-h-[calc(100vh-136px)]">
            {/* Background image + overlay */}
            <div className="absolute inset-0 bg-[url('/hero-bg.png')] bg-cover bg-center" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
            
            <div className="relative z-10 p-6 flex flex-col h-full">
              {/* Logo y tagline */}
              <div className="text-center pt-8 pb-6">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-3 drop-shadow-lg">🇲🇽 MediCompara</h2>
                <p className="text-white/90 text-xl md:text-lg md:text-2xl">{t.tuMedicina}</p>
              </div>

              {/* Barra de búsqueda */}
              <div className="mb-6">
                <div className="flex bg-white rounded-2xl shadow-lg overflow-hidden">
                  <input
                    type="text"
                    placeholder={t.buscar}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && buscar(search)}
                    className="flex-1 px-5 py-4 text-xl md:text-lg md:text-2xl outline-none"
                  />
                  <button
                    onClick={() => buscar(search)}
                    className="px-6 bg-farmacia text-white font-semibold hover:bg-farmacia-dark transition"
                  >
                    🔍
                  </button>
                </div>
              </div>

              {/* Recientes */}
              {recientes.length > 0 && (
                <div className="mb-6">
                  <p className="text-white/80 text-base mb-2">{t.recientes}:</p>
                  <div className="flex flex-wrap gap-2">
                    {recientes.map((r, i) => (
                      <button
                        key={i}
                        onClick={() => { setSearch(r); buscar(r); }}
                        className="px-3 py-1.5 bg-white/20 text-white rounded-full text-base hover:bg-white/30 transition"
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Cards */}
              <div className="space-y-3 mt-auto">
                <button
                  onClick={() => setScreen('milista')}
                  className="w-full bg-white/20 backdrop-blur rounded-xl p-4 text-left text-white hover:bg-white/30 transition flex items-center justify-between"
                >
                  <span className="text-xl md:text-lg md:text-2xl">💊 {t.misMedicinas} ({miLista.length})</span>
                  <span className="text-xl md:text-lg md:text-2xl">→</span>
                </button>
                <button
                  onClick={() => setScreen('farmacias')}
                  className="w-full bg-white/20 backdrop-blur rounded-xl p-4 text-left text-white hover:bg-white/30 transition flex items-center justify-between"
                >
                  <span className="text-xl md:text-lg md:text-2xl">📍 {t.farmacias}</span>
                  <span className="text-xl md:text-lg md:text-2xl">→</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* RESULTADO SCREEN */}
        {screen === 'resultado' && resultado && (
          <div className="p-4">
            <button onClick={() => setScreen('home')} className="text-farmacia mb-4">← Atrás</button>
            
            <p className="text-gray-600 text-base">{t.tuBusqueda}</p>
            <p className="text-xl md:text-lg md:text-lg md:text-xl font-bold mb-4">{resultado.usa} {resultado.dosis}</p>
            
            <div className="border-t-2 border-farmacia pt-4 mb-4">
              <p className="text-gray-600">{t.enMexico}</p>
              <div className="bg-farmacia/10 rounded-xl p-4 mt-2">
                <p className="text-xl md:text-lg md:text-lg md:text-xl font-bold text-farmacia">{resultado.mx}</p>
                <p className="text-xl md:text-lg md:text-2xl text-gray-700">{resultado.dosis}</p>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => {
                      const utterance = new SpeechSynthesisUtterance(resultado.mx)
                      utterance.lang = 'es-MX'
                      speechSynthesis.speak(utterance)
                    }}
                    className="px-4 py-2 bg-white rounded-lg text-base flex items-center gap-1"
                  >
                    🔊 {t.escuchar}
                  </button>
                  <button
                    onClick={() => navigator.clipboard.writeText(resultado.mx)}
                    className="px-4 py-2 bg-white rounded-lg text-base flex items-center gap-1"
                  >
                    📋 {t.copiar}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex gap-2 mb-4">
              <span className="text-base text-green-700 bg-green-100 px-2 py-1 rounded">✅ {t.mismoIngrediente}</span>
              <span className="text-base text-blue-700 bg-blue-100 px-2 py-1 rounded">✅ {t.aprobado}</span>
            </div>

            <div className="mb-4">
              <p className="text-gray-600 mb-2">💰 {t.precios}</p>
              {[
                { nombre: 'Similares', precio: resultado.precioSimilares, best: true },
                { nombre: 'Guadalajara', precio: resultado.precioGuadalajara },
                { nombre: 'Del Ahorro', precio: resultado.precioAhorro },
                { nombre: 'Benavides', precio: resultado.precioBenavides },
              ].map((f, i) => (
                <div key={i} className={`flex justify-between items-center p-3 rounded-lg mb-2 ${f.best ? 'bg-green-100 border-2 border-green-500' : 'bg-gray-100'}`}>
                  <span className={f.best ? 'font-bold text-green-800' : ''}>{f.best ? '🟢' : '⚪'} {f.nombre}</span>
                  <span className={f.best ? 'font-bold text-green-800' : ''}>${f.precio} MXN {f.best && '★'}</span>
                </div>
              ))}
            </div>

            <div className="bg-naranja/20 p-3 rounded-lg mb-4 text-center">
              <p className="text-naranja font-bold text-xl md:text-lg md:text-2xl">
                💵 {t.ahorras}: ~${resultado.precioUSA - resultado.precioSimilares} MXN ({Math.round((1 - resultado.precioSimilares/resultado.precioUSA) * 100)}%)
              </p>
            </div>

            <button
              onClick={() => setModoFarmacia(resultado)}
              className="w-full py-4 bg-farmacia text-white text-xl md:text-lg md:text-lg md:text-xl font-bold rounded-xl mb-3 hover:bg-farmacia-dark transition"
            >
              🏪 {t.modoFarmacia}
            </button>

            <button
              onClick={() => window.open('tel:' + farmacias[0].tel, '_self')}
              className="w-full py-5 bg-green-600 text-white text-lg md:text-xl font-bold rounded-xl mb-3 hover:bg-green-700 transition flex items-center justify-center gap-3"
            >
              📞 {lang === 'es' ? 'Llamar Farmacia Cercana' : 'Call Nearest Pharmacy'}
            </button>

            <button
              onClick={() => { agregarLista(resultado); alert(lang === 'es' ? 'Guardado!' : 'Saved!'); }}
              className="w-full py-3 border-2 border-farmacia text-farmacia rounded-xl font-semibold"
            >
              💊 {t.guardar}
            </button>
          </div>
        )}

        {/* MI LISTA SCREEN */}
        {screen === 'milista' && (
          <div className="p-4">
            <button onClick={() => setScreen('home')} className="text-farmacia mb-4">← Atrás</button>
            <h2 className="text-xl md:text-lg md:text-lg md:text-xl font-bold mb-4">💊 {t.misMedicinas}</h2>
            
            {miLista.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No tienes medicinas guardadas</p>
            ) : (
              <>
                <div className="bg-naranja/20 p-4 rounded-xl mb-4">
                  <p className="text-naranja font-bold text-xl md:text-lg md:text-2xl text-center">
                    💰 {t.ahorro} ${calcularAhorro()} MXN/mes
                  </p>
                </div>
                
                {miLista.map((m, i) => (
                  <div key={i} className="bg-white rounded-xl p-4 shadow mb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-bold">{m.usa} → <span className="text-farmacia">{m.mx}</span></p>
                        <p className="text-base text-gray-600">{m.dosis}</p>
                        <p className="text-base text-green-600 font-medium">Desde ${m.precioSimilares} MXN</p>
                      </div>
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => { setResultado(m); setScreen('resultado'); }}
                          className="text-sm px-3 py-1 bg-farmacia text-white rounded-lg"
                        >
                          {t.verPrecios}
                        </button>
                        <button
                          onClick={() => setModoFarmacia(m)}
                          className="text-sm px-3 py-1 bg-gray-200 rounded-lg"
                        >
                          🏪
                        </button>
                        <button
                          onClick={() => quitarLista(m.usa)}
                          className="text-sm px-3 py-1 text-red-500"
                        >
                          {t.quitar}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        )}

        {/* FARMACIAS SCREEN */}
        {screen === 'farmacias' && (
          <div className="p-4">
            <button onClick={() => setScreen('home')} className="text-farmacia mb-4">← Atrás</button>
            <h2 className="text-xl md:text-lg md:text-lg md:text-xl font-bold mb-4">📍 {t.farmacias}</h2>
            
            {farmacias.map((f, i) => (
              <div key={i} className="bg-white rounded-xl p-4 shadow mb-3">
                <p className="font-bold text-xl md:text-lg md:text-2xl">{f.nombre}</p>
                <p className="text-gray-600 text-base">{f.direccion}</p>
                <p className="text-farmacia font-medium">{f.distancia}</p>
                <div className="flex gap-2 mt-3">
                  <a
                    href={`https://maps.google.com/?q=${f.lat},${f.lng}`}
                    target="_blank"
                    rel="noopener"
                    className="flex-1 py-2 bg-farmacia text-white text-center rounded-lg text-base"
                  >
                    🗺️ {t.navegar}
                  </a>
                  <a
                    href={`tel:${f.tel}`}
                    className="flex-1 py-2 bg-gray-200 text-center rounded-lg text-base"
                  >
                    📞 {t.llamar}
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Tab Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/20 backdrop-blur flex justify-around py-3 z-40">
        <button onClick={() => setScreen('home')} className={`flex flex-col items-center ${screen === 'home' ? 'text-farmacia' : 'text-gray-400'}`}>
          <span className="text-xl md:text-lg md:text-2xl">🏠</span>
          <span className="text-sm">Home</span>
        </button>
        <button onClick={() => setScreen('milista')} className={`flex flex-col items-center ${screen === 'milista' ? 'text-farmacia' : 'text-gray-400'}`}>
          <span className="text-xl md:text-lg md:text-2xl">💊</span>
          <span className="text-sm">{lang === 'es' ? 'Lista' : 'List'}</span>
        </button>
        <button onClick={() => setScreen('farmacias')} className={`flex flex-col items-center ${screen === 'farmacias' ? 'text-farmacia' : 'text-gray-400'}`}>
          <span className="text-xl md:text-lg md:text-2xl">📍</span>
          <span className="text-sm">{lang === 'es' ? 'Farmacias' : 'Pharmacies'}</span>
        </button>
      </nav>

      {/* Footer */}
      <div className="text-center text-sm text-white/70 pb-2 fixed bottom-16 left-0 right-0 bg-transparent">
        Hecho con 🧡 por Colmena 2026
      </div>
    </div>
  )
}
