type MenuNode = {
  name: string;
  path: string;
  children?: MenuNode[];
  isFile: boolean;
};

interface SidebarProps {
  menuTree: MenuNode[];
  slugval: string;
}

const isMenuOpen = (menu: MenuNode[], slugval: string): boolean => {
  return menu.some(
    (item) =>
      item.path === slugval ||
      (item.children && isMenuOpen(item.children, slugval))
  );
};

const renderMenu = (menu: MenuNode[], slugval: string) => {
  return (
    <ul className="max-w space-y-1 text-gray-500 list-disc list-inside dark:text-gray-400">
      {menu.map((item) => {
        const isSelected = item.path === slugval; // Check if the current folder is selected

        return (
          <li key={item.path} className={`policy_cmp ${isSelected ? "bg-gray-300 dark:bg-gray-700" : ""}`}>
            {item.isFile ? (
              <a
                href={`${item.path}/`}
                className={isSelected ? "inner-menu-select" : ""}
              >
                {item.name}
              </a>
            ) : (
              <details open={isMenuOpen([item], slugval)}>
                <summary
                  className={`cursor-pointer flex fst_mn ${
                    isSelected ? "bg-gray-300 dark:bg-gray-700" : ""
                  }`}
                >
                  <h2 className="grow">{item.name}</h2>

                  <svg
                    aria-hidden="true"
                    className="caret arrow-ico"
                    width="30"
                    height="30"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M14.83 11.29L10.59 7.05C10.497 6.95628 10.3864 6.88189 10.2646 6.83112C10.1427 6.78035 10.012 6.75421 9.88 6.75421C9.74799 6.75421 9.61729 6.78035 9.49543 6.83112C9.37357 6.88189 9.26297 6.95628 9.17 7.05C8.98375 7.23737 8.87921 7.49082 8.87921 7.755C8.87921 8.0192 8.98375 8.27265 9.17 8.46L12.71 12L9.17 15.54C8.98375 15.7274 8.87921 15.9808 8.87921 16.245C8.87921 16.5092 8.98375 16.7626 9.17 16.95C9.26344 17.0427 9.37426 17.116 9.4961 17.1658C9.61794 17.2155 9.7484 17.2408 9.88 17.24C10.0116 17.2408 10.1421 17.2155 10.2639 17.1658C10.3857 17.116 10.4966 17.0427 10.59 16.95L14.83 12.71C14.9237 12.617 14.9981 12.5064 15.0489 12.3846C15.0997 12.2627 15.1258 12.132 15.1258 12C15.1258 11.868 15.0997 11.7373 15.0489 11.6154C14.9981 11.4936 14.9237 11.383 14.83 11.29Z"></path>
                  </svg>
                </summary>
                {item.children && (
                  <ul className="top-level border-gray-200 my-2 sub-folder">
                    {renderMenu(item.children, slugval)}
                  </ul>
                )}
              </details>
            )}
          </li>
        );
      })}
    </ul>
  );
};

const Sidebar = ({ menuTree, slugval = "" }: SidebarProps) => {
  return <nav>{renderMenu(menuTree, slugval)}</nav>;
};

export default Sidebar;
