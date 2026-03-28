// Actions for UI customization
export const MENU_OPEN = '@customization/MENU_OPEN';
export const MENU_TYPE = '@customization/MENU_TYPE';

export const setMenuOpen = (isOpen: string) => ({
    type: MENU_OPEN,
    isOpen
});

export const setMenuType = (navType: string) => ({
    type: MENU_TYPE,
    navType
});
