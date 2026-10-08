import { useState } from "react";

function LocationPicker({ onLocationChange }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [location, setLocation] = useState(null);

  const getCurrentLocation = () => {
    setError("");
    setLoading(true);

    if (!navigator.geolocation) {
      setError("GPS is not supported by this browser.");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        const accuracy = position.coords.accuracy;

        let placeName = "Current Location";

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`,
          );

          if (response.ok) {
            const data = await response.json();

            placeName =
              data?.address?.city ||
              data?.address?.town ||
              data?.address?.village ||
              data?.address?.municipality ||
              data?.display_name ||
              "Current Location";
          }
        } catch (reverseError) {
          console.error("Reverse geocoding error:", reverseError);
        }

        const locationData = {
          latitude,
          longitude,
          accuracy,
          placeName,
        };

        setLocation(locationData);
        setLoading(false);

        if (onLocationChange) {
          onLocationChange(locationData);
        }
      },

      (geoError) => {
        setLoading(false);

        switch (geoError.code) {
          case geoError.PERMISSION_DENIED:
            setError("Please allow location access in your browser.");
            break;

          case geoError.POSITION_UNAVAILABLE:
            setError("Your current location is unavailable.");
            break;

          case geoError.TIMEOUT:
            setError("Location request timed out. Please try again.");
            break;

          default:
            setError("Unable to get your current location.");
        }
      },

      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      },
    );
  };

  return (
    <div className="w-full">
      <button
        type="button"
        onClick={getCurrentLocation}
        disabled={loading}
        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-5 py-3 font-black transition-all duration-300"
      >
        {loading ? "📍 Getting Location..." : "📍 Use My Current Location"}
      </button>

      {error && (
        <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {error}
        </div>
      )}

      {location && (
        <div className="mt-4 rounded-2xl border border-blue-200 bg-blue-50 p-4">
          <p className="text-xs uppercase tracking-wider font-black text-blue-600">
            CURRENT LOCATION
          </p>

          <p className="mt-1 text-lg font-black text-slate-900">
            📍 {location.placeName}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 text-sm">
            <div>
              <span className="font-bold text-slate-600">Latitude:</span>{" "}
              {location.latitude.toFixed(6)}
            </div>

            <div>
              <span className="font-bold text-slate-600">Longitude:</span>{" "}
              {location.longitude.toFixed(6)}
            </div>
          </div>

          <p className="mt-2 text-xs text-slate-500">
            Accuracy: approximately {Math.round(location.accuracy)} meters
          </p>
        </div>
      )}
    </div>
  );
}

export default LocationPicker;
