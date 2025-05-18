import { connectDB } from '../../../lib/mongodb';
import Empresa from '../../../models/empresaSchema';

export async function GET() {
  await connectDB();
  const empresas = await Empresa.find();
  return Response.json(empresas);
}

export async function POST(req) {
  console.log('back:',req.body)
  try {
    await connectDB();
    const data = await req.json();
    const nuevaEmpresa = await Empresa.create(data);
    return new Response(JSON.stringify(nuevaEmpresa), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: 'Error al crear la empresa' }), {
      status: 500,
    });
  }
}
