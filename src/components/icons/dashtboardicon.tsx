import { FC } from 'react';
import { SvgIcon } from '../shared'; // Asegúrate de que el componente SvgIcon esté importado correctamente

const AnalyticsUpIcon: FC = () => (
  <SvgIcon className="w-6 h-6"> {/* Usa Tailwind para ajustar el tamaño */}
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 23 23" fill="none">
      <defs>
        <style>
          {`
            .cls-1 {
              fill: #1d1e56;
            }
          `}
        </style>
      </defs>
      <g id="Capa_1-2" data-name="Capa 1">
        <g id="hugeicons--analytics-up">
          <g id="Trazado_485" data-name="Trazado 485">
            <path
              className="cls-1"
              d="m11.51,23c-5.23,0-7.85,0-9.68-1.83-1.83-1.83-1.83-4.44-1.83-9.66h1s-1-.01-1-.01C0,6.28,0,3.66,1.83,1.83,3.66,0,6.28,0,11.49,0s7.85,0,9.68,1.83c1.83,1.83,1.83,4.45,1.83,9.66s0,7.85-1.83,9.68c-1.83,1.83-4.45,1.83-9.66,1.83Zm0-21c-4.67,0-7.01,0-8.26,1.24-1.24,1.24-1.24,3.59-1.24,8.26h0c0,4.67,0,7.01,1.24,8.26,1.25,1.24,3.59,1.24,8.26,1.24s7.01,0,8.26-1.24c1.24-1.25,1.24-3.59,1.24-8.26s0-7.01-1.24-8.26c-1.25-1.24-3.59-1.24-8.26-1.24Zm5.53,17.13c-.55,0-1-.45-1-1v-5.53c0-.55.45-1,1-1s1,.45,1,1v5.53c0,.55-.45,1-1,1Zm-5.53,0c-.55,0-1-.45-1-1v-3.32c0-.55.45-1,1-1s1,.45,1,1v3.32c0,.55-.45,1-1,1Zm-5.53,0c-.55,0-1-.45-1-1v-2.21c0-.55.45-1,1-1s1,.45,1,1v2.21c0,.55-.45,1-1,1Z"
            />
          </g>
          <g id="Trazado_486" data-name="Trazado 486">
            <path
              className="cls-1"
              d="m5.41,11.94c-.2,0-.4,0-.58,0-.55-.02-.98-.48-.97-1.03.02-.55.47-.99,1.03-.97,2.38.08,6.61-.34,9.36-3.82l-.4.06c-.55.09-1.06-.28-1.15-.83s.28-1.06.83-1.15l2.07-.33s.08-.01.12-.01c.67-.03,1.31.34,1.64.93.03.06.06.12.08.19l.55,1.81c.16.53-.14,1.09-.67,1.25-.53.16-1.09-.14-1.25-.67l-.07-.24c-3.06,4.1-7.7,4.82-10.6,4.82Z"
            />
          </g>
        </g>
      </g>
    </svg>
  </SvgIcon>
);

export default AnalyticsUpIcon;