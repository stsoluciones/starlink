// 'use client'

// import { useState } from 'react'
// import Image from 'next/image'
// import { imagesGaleria } from '../../constants/infoWeb'

// export default function ProductGallery() {
//   const [selectedImage, setSelectedImage] = useState(imagesGaleria[0])

//   return (
//     <div className="max-w-7xl mx-auto p-4 ">
//       <div className="rounded-2xl overflow-hidden mb-4">
//         <Image
//           src={selectedImage.src}
//           alt={selectedImage.alt}
//           title={selectedImage.alt}
//           aria-label={selectedImage.alt}
//           width={800}
//           height={500}
//           className="w-full object-contain"
//           unoptimized={true}
//           loading="lazy"
//           placeholder="blur"
//           blurDataURL="/icons/icon-512x512.png"
//         />
//       </div>
//       <div className="flex gap-4 justify-center">
//         {imagesGaleria.map((img, idx) => (
//           <button
//             key={idx}
//             onClick={() => setSelectedImage(img)}
//             className={`border rounded-lg p-1 transition ${
//               img.src === selectedImage.src ? 'border-blue-500' : 'border-gray-300'
//             }`}
//           >
//             <Image 
//               src={img.src} 
//               alt={img.alt} 
//               title={img.alt} 
//               aria-label={img.alt} 
//               width={100} 
//               height={70} 
//               className="object-contain"
//               unoptimized={true}
//               loading="lazy"
//               placeholder="blur"
//               blurDataURL="/icons/icon-512x512.png"
//             />
//           </button>
//         ))}
//       </div>
//     </div>
//   )
// }
