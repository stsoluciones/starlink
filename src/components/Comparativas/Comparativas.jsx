import React from "react"
import Link from "next/link"
import { HardDrive, MemoryStick, SquarePower, CircuitBoard } from "lucide-react"

const comparisonData = [
  { href: "/comparativas/almacenamiento", title: "Almacenamiento", description: "Conoce las comparativas de los distintos tipos de almacenamiento", icon: <HardDrive className="h-8 w-8" /> },
  { href: "/comparativas/memoria", title: "Memoria RAM", description: "Explora las comparativas de los diferentes tipos de Memoria RAM", icon: <MemoryStick className="h-8 w-8" /> },
  { href: "/comparativas/fuente", title: "Fuentes de Alimentación", description: "Explora las comparativas de las diferentes fuentes de alimentación", icon: <SquarePower className="h-8 w-8" /> },
  { href: "/comparativas/mothers", title: "Motherboard", description: "Explora las comparativas de las mothers", icon: <CircuitBoard className="h-8 w-8" /> },
]


const Comparativas = () => {
  return (
    <section id="comparaciones" className="mx-auto max-w-2xl py-16 px-4 sm:py-24 lg:max-w-7xl lg:px-8">
      <h2 className="mb-8 text-3xl md:text-4xl text-center font-extrabold text-primary uppercase">Comparativas</h2>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {comparisonData.map((item, index) => (
          <ComparisonCard key={index} {...item} />
        ))}
      </div>
    </section>
  )
}

const ComparisonCard = ({ href, title, description, icon }) => (
  <Link href={href} className="block" title="Ver comparativa" aria-label="Ver comparativa">
    <div className="h-full md:p-6 p-2 bg-white rounded-lg shadow-md transition-transform hover:scale-105 hover:shadow-lg">
      <div className="flex items-center space-x-4 mb-4">
        {icon}
        <h3 className="text-xl font-bold text-gray-900">{title}</h3>
      </div>
      <p className="text-gray-600">{description}</p>
    </div>
  </Link>
)

export default Comparativas
