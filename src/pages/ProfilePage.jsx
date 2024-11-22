import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const ProfilePage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);

  const imageName = location.state?.image;

  useEffect(() => {
    if (!imageName) {
      navigate("/"); // Redirect if no image is provided
      return;
    }

    fetch("/public/web_model/dataset.json")
      .then((res) => res.json())
      .then((data) => {
        const userId = imageName.split(".")[0];
        const user = data[userId];
        setUserData(user || { name: "Unknown", image: imageName });
      });
  }, [imageName, navigate]);

  if (!userData) return <div>Loading...</div>;

  return (
    <div>
      <img src={`/public/dataset/${imageName}`} alt={userData.name} />
      <h1>{userData.name}</h1>
    </div>
  );
};

export default ProfilePage;
