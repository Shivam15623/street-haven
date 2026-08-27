import { Icon } from "@iconify/react/dist/iconify.js";
import { Suspense, useEffect, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigation } from "react-router-dom";
import "@assets/css/layout.css";
import ThemeToggleButton from "../../helper/ThemeToggleButton.tsx";
import SiteLogo from "@assets/images/auth/e5fcae70d4835039e473c6b00f4a901799a86cf3.png";
import ProfileDropdown from "../../helper/ProfileDropdown.tsx";
import NotificationDropdown from "../../helper/NotificationDropdown.tsx";
import DashboardIcon from "../../assets/icons/sidebaricons/dashboard.svg?react";
import AgencyInfo from "../../assets/icons/sidebaricons/Agency.svg?react";
import TasksIcon from "../../assets/icons/sidebaricons/Task.svg?react";
import CertificateIcon from "../../assets/icons/sidebaricons/Certificate.svg?react";
// import Events from "../../assets/icons/sidebaricons/EventsIcon2.svg?react";
// import FormIcon from "../../assets/icons/sidebaricons/Forms.svg?react";
import ItNFacility from "../../assets/icons/sidebaricons/Facility.svg?react";
import ProgramIcon from "../../assets/icons/sidebaricons/Program.svg?react";
import SearchContent from "../../helper/SearchContent.tsx";
import EmployeesIcon from "../../assets/icons/sidebaricons/Employees.svg?react";
import { PERMISSIONS } from "../../utills/auth/permissions.ts";
import useHasPermission from "../../hooks/Auth.ts";

import Loader from "../../components/Loader.tsx";
import { useSelector } from "react-redux";
import { selectAuth } from "../../redux/AuthSlice.ts";

const menuItems = [
  {
    label: "Dashboard",
    path: "/",
    icon: DashboardIcon,
    public: true, // everyone can see
  },

  {
    label: "Volunteers Training",
    path: "/volunteer-training",
    icon: ProgramIcon,
    permission: PERMISSIONS.VIEW_PROGRAM_MANUALS,
  },
  {
    label: "Facility",
    path: "/it_facility",
    icon: ItNFacility,
    permissions: [
      PERMISSIONS.TICKET_VIEW_SELF,
      PERMISSIONS.TICKET_REPORT_ALL,
      PERMISSIONS.TICKET_REPORT_SELF_MANAGED,
      PERMISSIONS.VIEW_FAQS,
      PERMISSIONS.VIEW_EMERGENCY_CONTACTS,
      PERMISSIONS.TICKET_CREATE,
      PERMISSIONS.LOCATION_VIEW,
    ],
  },
  {
    label: "Agency Information",
    path: "/agency_info",
    icon: AgencyInfo,
    permissions: [
      PERMISSIONS.VIEW_COLLECTIVE_AGREEMENTS,
      PERMISSIONS.VIEW_ANNOUNCEMENTS,
    ],
  },
  {
    label: "Tasks",
    path: "/tasks",
    icon: TasksIcon,
    permissions: [PERMISSIONS.TASK_VIEW_SELF, PERMISSIONS.TASK_VIEW_ALL], // available for all
  },
  {
    label: "Users",
    path: "/users",
    icon: EmployeesIcon,
    permission: PERMISSIONS.VIEW_EMPLOYEES,
  },
  {
    label: "Certifications",
    path: "/certificates",
    icon: CertificateIcon,
    permission: PERMISSIONS.TRAINING_CERTIFICATE_VIEW_ALL,
  },
];

const RootLayout = () => {
  const [mobileMenu, setMobileMenu] = useState(false);
  const location = useLocation(); // Hook to get the current route
  const [mobileMode, setMobileMode] = useState(false);
  const { hasPermission, hasAnyPermission } = useHasPermission();
  const { user } = useSelector(selectAuth);
  const navigation = useNavigation();
  const isLoading = navigation.state === "loading";
  const filteredMenu = menuItems.filter((m) => {
    // Public menu item
    if (m.public) return true;

    // Single permission
    if (m.permission) {
      return hasPermission({
        action: m.permission,
      });
    }

    // Multiple permissions - ANY one is enough
    if (m.permissions?.length) {
      return hasAnyPermission(m.permissions);
    }

    // No public flag or permission
    return false;
  });
  const canSearch = hasAnyPermission([
    PERMISSIONS.VIEW_ANNOUNCEMENTS,
    PERMISSIONS.VIEW_COLLECTIVE_AGREEMENTS,
    PERMISSIONS.VIEW_PROGRAM_MANUALS,
  ]);
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
      ".sidebar-menu .dropdown > a, .sidebar-menu .dropdown > Link",
    );

    dropdownTriggers.forEach((trigger) => {
      trigger.addEventListener("click", handleDropdownClick);
    });

    const openActiveDropdown = () => {
      const allDropdowns = document.querySelectorAll(".sidebar-menu .dropdown");
      allDropdowns.forEach((dropdown) => {
        const submenuLinks = dropdown.querySelectorAll<HTMLAnchorElement>(
          ".sidebar-submenu li a",
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
                {user?.role
                  ?.split("_")
                  .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(" ")}{" "}
                Portal
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
              {canSearch && (
                <div className="d-none d-md-block">
                  <SearchContent
                    mobileMode={mobileMode}
                    onclose={() => setMobileMode(false)}
                  />
                </div>
              )}
            </div>
            {canSearch && mobileMode && (
              <div className="d-block d-md-none w-75">
                <SearchContent
                  mobileMode={mobileMode}
                  onclose={() => setMobileMode(false)}
                />
              </div>
            )}

            {!mobileMode && (
              <div className="d-flex flex-wrap align-items-center gap-3">
                {!mobileMode && canSearch && (
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
          {isLoading ? (
            <Loader />
          ) : (
            <Suspense fallback={<Loader />}>
              <Outlet />
            </Suspense>
          )}
          {/* Footer section */}
          <footer className="d-footer footer-color">
            <div className="row align-items-center justify-content-between">
              <div className="col-auto">
                <p className="mb-0 text-street-base">© 2026 Street Haven</p>
              </div>
            </div>
          </footer>
        </div>
      </main>
    </section>
  );
};

export default RootLayout;
