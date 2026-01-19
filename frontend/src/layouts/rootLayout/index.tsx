import { Icon } from "@iconify/react/dist/iconify.js";
import {  useEffect, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigation } from "react-router-dom";
import "@assets/css/layout.css";
import ThemeToggleButton from "../../helper/ThemeToggleButton.tsx";
import SiteLogo from "@assets/images/auth/e5fcae70d4835039e473c6b00f4a901799a86cf3.png";
import ProfileDropdown from "../../helper/ProfileDropdown.tsx";
import NotificationDropdown from "../../helper/NotificationDropdown.tsx";
import DashboardIcon from "../../assets/icons/sidebaricons/dashboard.svg?react";
import AgencyInfo from "../../assets/icons/sidebaricons/Agency.svg?react";
import Events from "../../assets/icons/sidebaricons/EventsIcon2.svg?react";
import FormIcon from "../../assets/icons/sidebaricons/Forms.svg?react";
import ItNFacility from "../../assets/icons/sidebaricons/Facility.svg?react";
import ProgramIcon from "../../assets/icons/sidebaricons/Program.svg?react";
import SearchContent from "../../helper/SearchContent.tsx";
import EmployeesIcon from "../../assets/icons/sidebaricons/Employees.svg?react";
import { PERMISSIONS } from "../../utills/auth/permissions.ts";
import useHasPermission from "../../hooks/Auth.ts";

import Loader from "../../components/Loader.tsx";

const menuItems = [
  {
    label: "Dashboard",
    path: "/",
    icon: DashboardIcon,
    public: true, // everyone can see
  },
  {
    label: "Forms",
    path: "/forms",
    icon: FormIcon,
    public: true,
  },
  {
    label: "Program & Manuals",
    path: "/programs&manuals",
    icon: ProgramIcon,
    public: true,
  },
  {
    label: "Facility",
    path: "/it_facility",
    icon: ItNFacility,
    public: true, // everyone can see
  },
  {
    label: "Agency Information",
    path: "/agency_info",
    icon: AgencyInfo,
    public: true, // available for all
  },
  {
    label: "Events",
    path: "/events",
    icon: Events,
    public: true,
  },
  {
    label: "Employees",
    path: "/employees",
    icon: EmployeesIcon,
    permission: PERMISSIONS.VIEW_EMPLOYEES,
  },
];

const RootLayout = () => {
  const [mobileMenu, setMobileMenu] = useState(false);
  const location = useLocation(); // Hook to get the current route
  const [mobileMode, setMobileMode] = useState(false);
  const { hasPermission } = useHasPermission();
  const navigation = useNavigation();
  const isLoading = navigation.state === "loading";
  const filteredMenu = menuItems.filter((m) => {
    if (m.public) return true; // public items visible to all
    if (m.permission) {
      if (hasPermission({ action: m.permission })) {
        return true;
      } else {
        return false;
      }
    }

    return false; // hide if neither public nor allowed roles
  });

  useEffect(() => {
    const handleDropdownClick = (event: Event) => {
      event.preventDefault();
      const clickedLink = event.currentTarget as HTMLElement;
      const clickedDropdown = clickedLink.closest(".dropdown");

      if (!clickedDropdown) return;

      const isActive = clickedDropdown.classList.contains("open");

      // Close all dropdowns
      const allDropdowns = document.querySelectorAll(".sidebar-menu .dropdown");
      allDropdowns.forEach((dropdown) => {
        dropdown.classList.remove("open");
        const submenu = dropdown.querySelector<HTMLElement>(".sidebar-submenu");
        if (submenu) {
          submenu.style.maxHeight = "0px"; // Collapse submenu
        }
      });

      // Toggle the clicked dropdown
      if (!isActive) {
        clickedDropdown.classList.add("open");
        const submenu =
          clickedDropdown.querySelector<HTMLElement>(".sidebar-submenu");
        if (submenu) {
          submenu.style.maxHeight = `${submenu.scrollHeight}px`; // Expand submenu
        }
      }
    };

    // Attach click event listeners to dropdown triggers
    const dropdownTriggers = document.querySelectorAll<HTMLElement>(
      ".sidebar-menu .dropdown > a, .sidebar-menu .dropdown > Link"
    );

    dropdownTriggers.forEach((trigger) => {
      trigger.addEventListener("click", handleDropdownClick);
    });

    const openActiveDropdown = () => {
      const allDropdowns = document.querySelectorAll(".sidebar-menu .dropdown");
      allDropdowns.forEach((dropdown) => {
        const submenuLinks = dropdown.querySelectorAll<HTMLAnchorElement>(
          ".sidebar-submenu li a"
        );
        submenuLinks.forEach((link) => {
          if (
            link.getAttribute("href") === location.pathname ||
            link.getAttribute("to") === location.pathname
          ) {
            dropdown.classList.add("open");
            const submenu =
              dropdown.querySelector<HTMLElement>(".sidebar-submenu");
            if (submenu) {
              submenu.style.maxHeight = `${submenu.scrollHeight}px`; // Expand submenu
            }
          }
        });
      });
    };

    // Open the submenu that contains the active route
    openActiveDropdown();

    // Cleanup event listeners on unmount
    return () => {
      dropdownTriggers.forEach((trigger) => {
        trigger.removeEventListener("click", handleDropdownClick);
      });
    };
  }, [location.pathname]);
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMobileMode(false);
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);
  const mobileMenuControl = () => {
    setMobileMenu(!mobileMenu);
  };
  useEffect(() => {
    // Close sidebar on route change (mobile only)
    if (window.innerWidth < 768) {
      setMobileMenu(false);
    }
  }, [location.pathname]);
  return (
    <section>
      {/* sidebar */}
      <aside
        className={mobileMenu ? "sidebar sidebar-open " : "sidebar "}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="py-sm-16 py-20 px-12 px-sm-8 d-flex flex-column align-items-center ">
          <div className="d-flex mx-auto align-items-center gap-2 justify-content-between ">
            <img className="street-site-logo" src={SiteLogo} />
            <div className={` flex-column  d-flex `}>
              <h3 className="mb-0 fw-bold text-street-dark text-sm  md:text-md text-uppercase">
                Street haven
              </h3>
              <span className="fw-normal text-xxs sm:text-xs text-street-base">
                Employee Portal
              </span>
            </div>
          </div>
        </div>
        <hr className="d-block d-sm-none mb-16" />
        <div className="sidebar-menu-area px-20">
          <ul className="sidebar-menu" id="sidebar-menu">
            {filteredMenu.map((item, index) => {
              const ItemIcon = item.icon;
              return (
                <li key={index}>
                  <NavLink
                    to={item.path}
                    onClick={() => {
                      if (window.innerWidth < 768) {
                        setMobileMenu(false);
                      }
                    }}
                    className={(navData) =>
                      `${navData.isActive ? "active-page" : ""} `
                    }
                  >
                    <ItemIcon className="menu-icon  w-5 h-5" />

                    <span>{item.label}</span>
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </div>
      </aside>
      <div
        className={mobileMenu ? "overlay active" : "overlay "}
        onClick={() => setMobileMenu(false)}
      ></div>

      <main className="dashboard-main">
        <div className="navbar-header">
          <div className="d-flex align-items-center justify-content-between w-100 h-100">
            <div className="d-flex flex-nowrap align-items-center gap-4">
              <button
                onClick={mobileMenuControl}
                type="button"
                className="sidebar-mobile-toggle"
              >
                <Icon icon="heroicons:bars-3-solid" className="icon" />
              </button>
              <div className="d-none d-md-block">
                <SearchContent
                  mobileMode={mobileMode}
                  onclose={() => setMobileMode(false)}
                />
              </div>
            </div>
            {mobileMode && (
              <div className="d-block d-md-none w-75">
                <SearchContent
                  mobileMode={mobileMode}
                  onclose={() => setMobileMode(false)}
                />
              </div>
            )}

            {!mobileMode && (
              <div className="d-flex flex-wrap align-items-center gap-3">
                {!mobileMode && (
                  <button
                    className="d-md-none btn btn-neutral-200  p-1 d-flex align-items-center rounded-circle "
                    onClick={() => setMobileMode(true)}
                  >
                    <Icon
                      icon="mi:search"
                      className="text-street-base text-sm"
                    />
                  </button>
                )}
                {/* ThemeToggleButton */}
                <ThemeToggleButton />

                <NotificationDropdown />
                <ProfileDropdown />

                {/* Profile dropdown end */}
              </div>
            )}
          </div>
        </div>

        {/* dashboard-main-body */}
        <div className="dashboard-main-body">
          {isLoading ? <Loader /> : <Outlet />}
          {/* Footer section */}
          <footer className="d-footer footer-color">
            <div className="row align-items-center justify-content-between">
              <div className="col-auto">
                <p className="mb-0 text-street-base">© 2025 Street Haven</p>
              </div>
            </div>
          </footer>
        </div>
      </main>
    </section>
  );
};

export default RootLayout;
