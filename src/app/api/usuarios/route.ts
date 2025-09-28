//app/api/usuarios/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { connectDB } from '../../../lib/mongodb';
import Usuario from '../../../models/User';
import Order from '../../../models/Order';
import jwt from 'jsonwebtoken';
import { auth } from '../../../../pages/api/firebaseAdminConfig';

// Helper para validar token y rol admin
function verifyAdmin(): { autorizado: boolean; error?: string; status?: number; decoded?: any } {
    try {
        const token = cookies().get('token')?.value;
        if (!token) return { autorizado: false, error: 'No autorizado - token faltante', status: 401 };
        const decoded = jwt.verify(token, process.env.JWT_SECRET!);
        // @ts-ignore
        if (!decoded || decoded.rol !== 'admin') {
            return { autorizado: false, error: 'Acceso denegado - requiere rol admin', status: 403 };
        }
        return { autorizado: true, decoded };
    } catch (e) {
        return { autorizado: false, error: 'Token inválido o expirado', status: 403 };
    }
}

export async function GET(req: Request) {
    try {
        const authAdmin = verifyAdmin();
        if (!authAdmin.autorizado) {
            return NextResponse.json({ error: authAdmin.error }, { status: authAdmin.status });
        }

        await connectDB();
        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get('page') || '1', 10);
        const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 200); // hard cap 200
        const skip = (page - 1) * limit;

        // Total usuarios para paginación
        const totalUsuarios = await Usuario.countDocuments({});
        const totalPages = Math.ceil(totalUsuarios / limit) || 1;

        // Aggregation para traer usuarios con estadísticas de pedidos
        const usuarios = await Usuario.aggregate([
            { $sort: { fechaRegistro: -1 } },
            { $skip: skip },
            { $limit: limit },
            {
                $lookup: {
                    from: 'orders',
                    let: { userUid: '$uid' },
                    pipeline: [
                        { $match: { $expr: { $eq: ['$usuarioUid', '$$userUid'] } } },
                        {
                            $group: {
                                _id: null,
                                totalPedidos: { $sum: 1 },
                                entregadas: { $sum: { $cond: [{ $eq: ['$estado', 'entregado'] }, 1, 0] } },
                                canceladas: { $sum: { $cond: [{ $eq: ['$estado', 'cancelado'] }, 1, 0] } }
                            }
                        }
                    ],
                    as: 'estadisticasPedidos'
                }
            },
            {
                $addFields: {
                    totalPedidos: { $ifNull: [{ $arrayElemAt: ['$estadisticasPedidos.totalPedidos', 0] }, 0] },
                    entregadas: { $ifNull: [{ $arrayElemAt: ['$estadisticasPedidos.entregadas', 0] }, 0] },
                    canceladas: { $ifNull: [{ $arrayElemAt: ['$estadisticasPedidos.canceladas', 0] }, 0] },
                }
            },
            {
                $project: {
                    _id: 0,
                    uid: 1,
                    nombreCompleto: 1,
                    correo: 1,
                    telefono: 1,
                    rol: 1,
                    fechaRegistro: 1,
                    totalPedidos: 1,
                    entregadas: 1,
                    canceladas: 1
                }
            }
        ]);

        return NextResponse.json({
            users: usuarios,
            page,
            limit,
            totalPages,
            totalUsers: totalUsuarios
        });
    } catch (error) {
        console.error('Error GET /api/usuarios:', error);
        return NextResponse.json({ error: 'Error al obtener usuarios' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        await connectDB();
    const body = await req.json();
    console.log('POST /api/usuarios body:', JSON.stringify(body));
        // Aceptar request que traiga factura en diferentes formatos y normalizar condicionIva
        const { uid, nombreCompleto, correo, dniOCuit, telefono, direccion, factura } = body;

        const mapCondicion = (val: any) => {
            if (!val) return val;
            // if factura comes as a JSON string, try to parse
            if (typeof val === 'string') {
                const asString = val.trim();
                // if it looks like JSON, parse it
                try {
                    const maybe = JSON.parse(asString);
                    if (maybe && typeof maybe === 'object' && 'condicionIva' in maybe) {
                        return mapCondicion(maybe.condicionIva);
                    }
                } catch (e) {
                    // not JSON: continue
                }
            }
            if (typeof val !== 'string') return val;
            const m = val.trim();
            // Normalize: remove diacritics using compatible regex, lowercase and remove spaces
            const normalize = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/\s+/g, '');
            const target = normalize(m);
            const map: Record<string,string> = {
                'consumidorfinal': 'consumidorFinal',
                'responsableinscripto': 'responsableInscripto',
                'monotributista': 'monotributista',
                'ivaexento': 'exento'
            };
            if (map[target]) return map[target];
            // accept already-correct internal keys
            if (['consumidorFinal','responsableInscripto','monotributista','exento'].includes(val)) return val;
            return val;
        };

        const normalizeFacturaInPlace = (f: any) => {
            if (!f || typeof f !== 'object') return;
            try {
                if ('condicionIva' in f) {
                    const old = f.condicionIva;
                    const normalized = mapCondicion(old);
                    if (normalized !== old) {
                        console.log('normalizeFacturaInPlace: converted', old, '->', normalized);
                    }
                    f.condicionIva = normalized;
                }
            } catch (e) {
                console.warn('normalizeFacturaInPlace failed', e);
            }
        };

        // normalize factura if present
        if (factura && typeof factura === 'object' && 'condicionIva' in factura) {
            // log incoming for debugging
            console.log('Incoming factura.condicionIva:', factura.condicionIva);
            // @ts-ignore
            const normalized = mapCondicion(factura.condicionIva);
            console.log('Normalized condicionIva ->', normalized);
            // @ts-ignore
            factura.condicionIva = normalized;
            body.factura = factura;
        }
        const authorizationHeader = req.headers.get('Authorization');
        //console.log('Request Body back:', { uid, nombreCompleto, correo, dniOCuit, telefono, direccion });
        //console.log('Authorization Header back:', authorizationHeader);
        if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
            //console.error('Error: Missing or invalid Authorization header');
            return NextResponse.json({ error: 'Unauthorized: Missing or invalid Authorization header' }, { status: 401 });
        }

        const idToken = authorizationHeader.split(' ')[1];
        //console.log('Firebase ID Token:', idToken);
        try {
            await auth.verifyIdToken(idToken);
            //console.log('Firebase ID Token Verified:', decodedToken);
        } catch (error) {
            //console.error("Error verifying Firebase ID token:", error);
            return NextResponse.json({ error: 'Unauthorized: Invalid Firebase ID token' }, { status: 401 });
        }
        
        const cleanDniOCuit = dniOCuit?.trim() || undefined;
        //  Validación de dniOCuit
        if (cleanDniOCuit) {
            const usuarioConMismoDni = await Usuario.findOne({ dniOCuit: cleanDniOCuit });
            if (usuarioConMismoDni) {
                return NextResponse.json(
                    { error: 'DNI/CUIT ya está en uso' },
                    { status: 400 }
                );
            }
        }

    let usuario = await Usuario.findOne({ uid });
        // If a user exists with a legacy/display value for condicionIva, normalize it in-place and persist
        if (usuario && usuario.factura && typeof usuario.factura === 'object' && 'condicionIva' in usuario.factura) {
            try {
                // @ts-ignore
                const current = usuario.factura.condicionIva;
                const normalizedDb = mapCondicion(current);
                if (normalizedDb && normalizedDb !== current) {
                    console.log('DB usuario.factura.condicionIva needs normalization:', current, '->', normalizedDb);
                    // @ts-ignore
                    usuario.factura.condicionIva = normalizedDb;
                    await usuario.save();
                    // re-fetch to ensure doc is in sync
                    usuario = await Usuario.findOne({ uid });
                }
            } catch (e) {
                console.warn('Failed to normalize existing usuario.factura:', e);
            }
        }
        let isNew = false;

        if (!usuario) {
            // ensure factura normalized before creating
            if (body.factura) normalizeFacturaInPlace(body.factura);
            usuario = new Usuario({
                uid,
                nombreCompleto,
                correo,
                dniOCuit: cleanDniOCuit,
                telefono,
                direccion,
                factura: body.factura || undefined,
                rol: 'cliente',
            });
            await usuario.save();
            isNew = true;
            //console.log('usuario creado:', usuario);
        } else {
            usuario.nombreCompleto = nombreCompleto || usuario.nombreCompleto;
            usuario.correo = correo || usuario.correo;
            usuario.dniOCuit = dniOCuit || usuario.dniOCuit;
            usuario.telefono = telefono || usuario.telefono;
            usuario.direccion = direccion || usuario.direccion;
            if (body.factura) {
                normalizeFacturaInPlace(body.factura);
                usuario.factura = body.factura;
            }
            await usuario.save();
        }
        const token = jwt.sign(
            {
                id: usuario._id,
                uid: usuario.uid,
                rol: usuario.rol,
            },
            process.env.JWT_SECRET!,
            { expiresIn: '1d' }
        );

        const response = NextResponse.json({ usuario, token }, { status: isNew ? 201 : 200 });

        response.cookies.set('token', token, {
            httpOnly: true,
            path: '/',
            maxAge: 60 * 60 * 24,
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production',
        });

        return response;

    } catch (error) {
        console.error('Error en /api/usuarios:', error);
        return NextResponse.json({ error: 'Error al crear/actualizar usuario' }, { status: 500 });
    }
}

