import React from "react";

export default function Loading({alto ='60px', ancho ='60px'}) {
  return (
    <div className="flex justify-center items-center h-64 bg-transparent absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%]">
      <div className={`border-8 border-t-primary-active border-primary border-solid rounded-full animate-spin`} style={{width:ancho, height:alto}}></div>
    </div>
  );
}