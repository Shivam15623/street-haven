import { Icon } from "@iconify/react/dist/iconify.js";
import userimage from "@assets/images/user.png";
import { Dropdown } from "react-bootstrap";
import { useDispatch } from "react-redux";
import { useLogoutMutation } from "../services/AuthApi";
import { selectAuth, setLoggedOut } from "../redux/AuthSlice";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
const ProfileDropdown = () => {
  const [logout] = useLogoutMutation();
  const dispatch = useDispatch();
  const { user } = useSelector(selectAuth);
  const navigate = useNavigate();

  const onLogout = async () => {

    try {
      const res = await logout(undefined).unwrap();
      if (res.statuscode === 200) {
        dispatch(setLoggedOut());
      }
    } catch (err) {
      console.log(err);
    }
  };
  return (
    <Dropdown className="user-dropdown" align="end">
      <Dropdown.Toggle className="rounded-circle">
        <img src={user?.profilePic ?? userimage} alt="User" />
      </Dropdown.Toggle>

      <Dropdown.Menu>
        {/* User Info */}
        <div className="user-info">
          <img src={user?.profilePic ?? userimage} alt="User" />
          <div>
            <p>
              {user?.firstName} {user?.lastName}
            </p>
            <small>{user?.email}</small>
          </div>
        </div>

        <Dropdown.Divider />

        {/* Menu Items */}
        <Dropdown.Item onClick={() => navigate(`/profile`)}>
          <Icon icon="solar:user-linear" width={20} height={20} />
          My Profile
        </Dropdown.Item>

        <Dropdown.Item onClick={onLogout}>
          <Icon icon="lucide:log-out" width={20} height={20} />
          Sign Out
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default ProfileDropdown;
