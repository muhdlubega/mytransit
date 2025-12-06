import { useState, useEffect, useCallback } from "react";
import { supabase } from "../services/supabaseClient";
import { useAuth } from "../contexts/AuthContext";
import { Favorite } from "../types/user";

export const useFavorites = () => {
  const { user, isAuthenticated } = useAuth();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchFavorites = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("favorites")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setFavorites(
        (data || []).map(f => ({
          id: f.id,
          userId: f.user_id,
          vehicleId: f.vehicle_id,
          routeId: f.route_id,
          vehicleType: f.vehicle_type,
          displayName: f.display_name,
          createdAt: f.created_at,
        }))
      );
    } catch (error) {
      console.error("Error fetching favorites:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchFavorites();
    } else {
      setFavorites([]);
    }
  }, [isAuthenticated, fetchFavorites]);

  const addFavorite = async (
    vehicleId: string,
    displayName: string,
    routeId?: string,
    vehicleType?: string
  ) => {
    if (!user) return { error: new Error("Must be logged in") };

    try {
      const { error } = await supabase.from("favorites").insert({
        user_id: user.id,
        vehicle_id: vehicleId,
        route_id: routeId,
        vehicle_type: vehicleType,
        display_name: displayName,
      });

      if (error) throw error;

      await fetchFavorites();
      return { error: null };
    } catch (error) {
      console.error("Error adding favorite:", error);
      return { error: error as Error };
    }
  };

  const removeFavorite = async (favoriteId: string) => {
    if (!user) return { error: new Error("Must be logged in") };

    try {
      const { error } = await supabase
        .from("favorites")
        .delete()
        .eq("id", favoriteId)
        .eq("user_id", user.id);

      if (error) throw error;

      setFavorites(prev => prev.filter(f => f.id !== favoriteId));
      return { error: null };
    } catch (error) {
      console.error("Error removing favorite:", error);
      return { error: error as Error };
    }
  };

  const isFavorite = (vehicleId: string) => {
    return favorites.some(f => f.vehicleId === vehicleId);
  };

  return {
    favorites,
    isLoading,
    addFavorite,
    removeFavorite,
    isFavorite,
    refreshFavorites: fetchFavorites,
  };
};
