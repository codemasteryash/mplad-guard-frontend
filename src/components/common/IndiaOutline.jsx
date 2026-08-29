import { INDIA_OUTLINE_PATH } from "../../data/indiaOutlinePath";

export default function IndiaOutline({ className, fill = "#1B3A73", opacity = 1, id = "india-outline" }) {
  return (
    <svg viewBox="0 0 1000 1000" className={className} aria-hidden="true">
      <path d={INDIA_OUTLINE_PATH} fill={fill} opacity={opacity} id={id} fillRule="evenodd" />
    </svg>
  );
}
