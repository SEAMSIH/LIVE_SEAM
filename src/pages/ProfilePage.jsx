import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { User, Mail, Phone, MapPin, Building } from "lucide-react";

const ProfilePage = () => {
  const [userData, setUserData] = useState(null);
  const location = useLocation();

  // Extract image name from location.state or any other source
  const imageName = location.state?.image || "2.jpg"; // Fallback image name if not available

  // Extract the ID from the image name (e.g., "1.jpg" becomes 1)
  const userId = imageName.split(".")[0]; // This assumes the image is named like "1.jpg", "2.jpg", etc.

  useEffect(() => {
    fetch("/public/web_model/dataset.json")
      .then((response) => response.json())
      .then((data) => {
        // Find the user by ID (e.g., userId corresponds to the key "1", "2", etc.)
        const user = data[userId]; // Directly access the user by ID
        setUserData(
          user || {
            // Fallback user data if not found
            name: "Default User",
            email: "default@example.com",
            phone: "+1 (555) 123-4567",
            location: "Default Location",
            department: "Default Department",
            image: "/models/default.jpg", // Default image URL
          }
        );
      })
      .catch((error) => {
        console.error("Error loading dataset.json:", error);
        setUserData({
          name: "Error",
          email: "Error",
          phone: "Error",
          location: "Error",
          department: "Error",
          image: "https://via.placeholder.com/150",
        });
      });
  }, [userId]); // Re-fetch when userId changes

  if (!userData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-white text-gray-900 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl overflow-hidden shadow-xl border border-gray-200">
          {/* Profile Header */}
          <div className="relative h-48 bg-gradient-to-r from-blue-500 to-blue-600">
            <div className="absolute -bottom-20 left-1/2 transform -translate-x-1/2">
              <img
                src={userData.image}
                alt={userData.name}
                className="w-40 h-40 rounded-full border-4 border-white object-cover shadow-lg"
              />
            </div>
          </div>

          {/* Profile Content */}
          <div className="pt-24 pb-8 px-8">
            <h1 className="text-3xl font-bold text-center mb-2">
              {userData.name}
            </h1>
            <p className="text-gray-500 text-center mb-8">
              Employee ID: {userId}
            </p>

            <div className="space-y-4 max-w-lg mx-auto">
              <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                <User className="w-6 h-6 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-500">Full Name</p>
                  <p className="font-medium">{userData.name}</p>
                </div>
              </div>

              <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                <Mail className="w-6 h-6 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{userData.email}</p>
                </div>
              </div>

              <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                <Building className="w-6 h-6 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-500">Department</p>
                  <p className="font-medium">{userData.department}</p>
                </div>
              </div>

              <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                <Phone className="w-6 h-6 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium">{userData.phone}</p>
                </div>
              </div>

              <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                <MapPin className="w-6 h-6 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-500">Location</p>
                  <p className="font-medium">{userData.location}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
