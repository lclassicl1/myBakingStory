import { updateRecipeVisibility } from "@/app/boards/actions";
import type { BoardVisibility } from "@/lib/boards";

type RecipeVisibilityToggleProps = {
  postId: string;
  returnPath: string;
  visibility?: BoardVisibility;
};

export function RecipeVisibilityToggle({ postId, returnPath, visibility }: RecipeVisibilityToggleProps) {
  const isPublic = visibility === "public";

  return (
    <form action={updateRecipeVisibility} className="visibility-toggle-form">
      <input name="boardKey" type="hidden" value="private-recipes" />
      <input name="postId" type="hidden" value={postId} />
      <input name="returnPath" type="hidden" value={returnPath} />
      <input name="visibility" type="hidden" value={isPublic ? "owner-only" : "public"} />
      <button
        aria-label={isPublic ? "비공개로 전환" : "공개로 전환"}
        aria-pressed={isPublic}
        className={isPublic ? "switch-toggle switch-toggle--on" : "switch-toggle"}
        type="submit"
      >
        <span className="switch-toggle__track" aria-hidden="true">
          <span className="switch-toggle__thumb" />
        </span>
        <span className="switch-toggle__label">{isPublic ? "공개" : "비공개"}</span>
      </button>
    </form>
  );
}
