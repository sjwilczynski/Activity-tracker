import { styled, useMediaQuery, useTheme } from "@mui/material";
import { AdditionalMenu } from "./AdditionalMenu";
import { GitHubLinkButton } from "./GitHubLinkButton";
import { ToggleThemeButton } from "./ToggleThemeButton";

const ButtonsContainer = styled("div")({
  display: "flex",
  position: "absolute",
  top: 10,
  right: 10,
});

export const AppBarButtons = () => {
  const matches = useMediaQuery(useTheme().breakpoints.down("md"));
  return matches ? (
    <AdditionalMenu>
      <GitHubLinkButton />
      <ToggleThemeButton />
    </AdditionalMenu>
  ) : (
    <ButtonsContainer>
      <GitHubLinkButton />
      <ToggleThemeButton />
    </ButtonsContainer>
  );
};
