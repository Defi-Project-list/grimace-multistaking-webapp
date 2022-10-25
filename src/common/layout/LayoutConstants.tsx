export enum SidebarItem {
  POOLS,
  REGISTER
}

export const SIDEBAR_ROUTES = {  
  [SidebarItem.POOLS]: "/pools",
  [SidebarItem.REGISTER]: "/register"
}

export const SIDEBAR_ITEMS = {  
  [SidebarItem.POOLS]: "pools",
  [SidebarItem.REGISTER]: "register"
}
