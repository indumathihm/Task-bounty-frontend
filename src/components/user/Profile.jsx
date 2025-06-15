import { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { updateUserProfile } from "../../slices/userSlice";

export default function Profile() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.data);
  const loading = useSelector((state) => state.user.loading);
  const error = useSelector((state) => state.user.error);

  const [email, setEmail] = useState("");
  const [bio, setBio] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");

  const fileInputRef = useRef(null);

  useEffect(() => {
    if (user) {
      setEmail(user.email || "");
      setBio(user.bio || "");
      setAvatarPreview(user.avatar || "");
    }
  }, [user]);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("email", email);
    formData.append("bio", bio);
    if (avatarFile) formData.append("avatar", avatarFile);

    const result = await dispatch(updateUserProfile({ formData }));

    if (updateUserProfile.fulfilled.match(result)) {
      const updated = result.payload.user || result.payload;
      setEmail(updated.email);
      setBio(updated.bio);
      setAvatarPreview(updated.avatar);
      setAvatarFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="mx-auto mt-12 p-8  text-left">
      <form onSubmit={handleSubmit} encType="multipart/form-data" className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Avatar
          </label>
          <div className="flex items-center gap-4 mb-2">
            {avatarPreview ? (
              <img
                src={avatarPreview}
                alt="Avatar"
                className="w-20 h-20 rounded-full object-cover border"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 border">
                No Avatar
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="block text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0
                file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>
        </div>

        <div>
          <label className="block mb-1 font-medium">Name</label>
          <input
            type="text"
            value={user?.name || ""}
            readOnly
            className="w-full px-3 py-2 border bg-gray-100 rounded-md cursor-not-allowed"
          />
        </div>

        <div>
          <label htmlFor="email" className="block mb-1 font-medium">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            required
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>

        <div>
          <label htmlFor="bio" className="block mb-1 font-medium">Bio</label>
          <textarea
            id="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>

        {error && <p className="text-red-600 font-medium">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 text-white rounded-md ${
            loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {loading ? "Updating..." : "Save Profile"}
        </button>
      </form>
    </div>
  );
}