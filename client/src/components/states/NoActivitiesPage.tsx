import { styled } from "@mui/material";
import { Link } from "react-router-dom";

const StyledLink = styled(Link)(({ theme }) => ({
  color: theme.palette.primary.main,
  textDecoration: "none",
  fontWeight: 500,
}));

const TextContainer = styled("div")({
  fontSize: 16,
  lineHeight: "32px",
});

const Highlight = styled("span")({
  fontWeight: 600,
});

export const NoActivitiesPage = () => {
  return (
    <TextContainer>
      <div>
        You haven't added any activities yet, so there is no data to display 😟
      </div>
      <div>
        To start your journey go to{" "}
        <StyledLink to="/welcome">homepage</StyledLink> add use{" "}
        <Highlight>Quick add</Highlight> button 😎
      </div>
      <div>
        You can also go to <StyledLink to="/profile">profile page</StyledLink>{" "}
        and use <Highlight>Upload activities</Highlight> button and add them by
        selecting a file in a proper format 😲
      </div>
    </TextContainer>
  );
};
