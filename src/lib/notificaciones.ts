"use client";

// Waraira — Alarma de validación comunitaria.
//
// Cuando un voluntario nuevo aparece en TU zona, suena una notificación: "¿lo conoces?
// aválalo". En un dispositivo / con el servidor (Convex) en línea esto cruza entre
// teléfonos. La notificación push a la app cerrada requiere Web Push (VAPID) + servidor,
// que se habilita al desplegar; aquí va la versión con la API de Notificaciones del navegador.

import { useEffect, useRef, useState } from "react";
import { useColeccion } from "./db";
import { usePerfil } from "./perfil";
import { mismaZona } from "./geografia";
import type { Voluntario } from "./model";

export function pedirPermisoNotificaciones() {
  try {
    if (typeof Notification !== "undefined" && Notification.permission === "default") {
      Notification.requestPermission().catch(() => {});
    }
  } catch {
    /* ignore */
  }
}

export function mostrarNotificacion(titulo: string, opciones?: NotificationOptions) {
  try {
    if (typeof Notification !== "undefined" && Notification.permission === "granted") {
      new Notification(titulo, opciones);
    }
  } catch {
    /* ignore */
  }
}

const VISTOS = "waraira-validacion-vistos";
function leerVistos(): string[] {
  try {
    return JSON.parse(localStorage.getItem(VISTOS) || "[]");
  } catch {
    return [];
  }
}
function guardarVistos(ids: string[]) {
  try {
    localStorage.setItem(VISTOS, JSON.stringify(ids));
  } catch {
    /* ignore */
  }
}

/**
 * Observa los voluntarios pendientes en MI zona. Devuelve el conteo (para el badge) y
 * dispara una notificación cuando aparece uno nuevo (no en la primera carga, para no
 * spamear con los que ya existían).
 */
export function useAlarmaValidacion(): number {
  const { perfil } = usePerfil();
  const { datos: voluntarios } = useColeccion<Voluntario>("voluntarios");
  const [pendientesN, setPendientesN] = useState(0);
  const inicializado = useRef(false);

  useEffect(() => {
    if (!perfil) {
      setPendientesN(0);
      return;
    }
    const pendientes = voluntarios.filter(
      (v) =>
        v.estadoValidacion !== "validado" &&
        (!perfil.telefono || v.telefono !== perfil.telefono) &&
        mismaZona(perfil, v),
    );
    setPendientesN(pendientes.length);

    const vistos = leerVistos();
    const nuevos = pendientes.filter((v) => !vistos.includes(v.id));
    if (nuevos.length > 0) {
      if (inicializado.current) {
        mostrarNotificacion("Waraira · nuevo voluntario en tu zona", {
          body: `${nuevos[0].nombre} se registró para cuidar niños. ¿Lo conoces? Toca para avalar.`,
          icon: "/icon.svg",
          tag: "waraira-validacion",
        });
      }
      guardarVistos([...vistos, ...nuevos.map((v) => v.id)]);
    }
    inicializado.current = true;
  }, [perfil, voluntarios]);

  return pendientesN;
}
