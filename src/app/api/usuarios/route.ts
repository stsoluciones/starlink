//app/api/usuarios/route.ts
import { NextResponse } from 'next/server';
import { connectDB } from '../../../lib/mongodb';
import Usuario from '../../../models/User';
import jwt from 'jsonwebtoken';
import { auth } from '../../../../pages/api/firebaseAdminConfig';

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

