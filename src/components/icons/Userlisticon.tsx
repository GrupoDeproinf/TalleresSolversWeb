import { FC } from 'react';
import { SvgIcon } from '../shared'; // Asegúrate de que este import sea correcto

const UserListIcon: FC = () => (
  <SvgIcon className="w-6 h-6"> {/* Puedes cambiar el tamaño con clases de Tailwind */}
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 22 20" fill="none">
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
        <g id="hugeicons--user-list">
          <path
            className="cls-1"
            d="m4.95,20c-1.58-.07-3.05-.76-4.08-1.91C.05,17.31-.05,16.49.02,15.95c.19-1.57,1.97-2.59,3.15-3.27.12-.07.24-.14.34-.2.02-.01.04-.03.06-.04,3.2-1.92,7.17-1.92,10.37,0,.12.07.25.15.4.23,1.18.68,2.96,1.7,3.15,3.27.07.54-.03,1.36-.9,2.2-.98,1.1-2.45,1.79-3.99,1.86h-7.64Zm-.3-5.88s-.04.03-.06.04c-.13.08-.28.16-.44.26-.62.36-2.09,1.2-2.16,1.78-.02.17.18.39.31.51.72.8,1.68,1.25,2.69,1.29h7.55c.96-.04,1.92-.5,2.6-1.25.17-.17.38-.4.36-.56-.07-.58-1.54-1.43-2.16-1.79-.16-.09-.31-.18-.43-.25-2.54-1.53-5.69-1.54-8.25-.03Zm16.34-4.12h-2c-.55,0-1-.45-1-1s.45-1,1-1h2c.55,0,1,.45,1,1s-.45,1-1,1Zm-12.5,0c-2.76,0-5-2.24-5-5S5.74,0,8.5,0s5,2.24,5,5-2.24,5-5,5Zm0-8c-1.65,0-3,1.35-3,3s1.35,3,3,3,3-1.35,3-3-1.35-3-3-3Zm12.5,5h-5c-.55,0-1-.45-1-1s.45-1,1-1h5c.55,0,1,.45,1,1s-.45,1-1,1Zm0-3h-5c-.55,0-1-.45-1-1s.45-1,1-1h5c.55,0,1,.45,1,1s-.45,1-1,1Z"
          />
        </g>
      </g>
    </svg>
  </SvgIcon>
);

export default UserListIcon;