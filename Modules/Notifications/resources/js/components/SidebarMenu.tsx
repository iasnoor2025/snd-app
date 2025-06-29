import React from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const SidebarMenu: React.FC = () => {
  const { t } = useTranslation();

  return (
    <ul>
      <li>
        <NavLink to="/notifications/scheduled" className={({ isActive }) => isActive ? 'active' : ''}>
          {t('notifications:scheduled.title')}
        </NavLink>
      </li>
    </ul>
  );
};

export default SidebarMenu;
