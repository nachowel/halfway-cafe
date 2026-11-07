import ResponsivePublicImage, {
  type ResponsivePublicImageProps,
} from "./ResponsivePublicImage";
import { resolveRequiredPublicImage } from "@/lib/public-images.server";
import type { PublicImageRole } from "@/types/public-image";

type ServerPublicImageProps = Omit<ResponsivePublicImageProps, "image"> & {
  source: string;
  role: PublicImageRole;
};

export default async function ServerPublicImage({ source, role, ...props }: ServerPublicImageProps) {
  return (
    <ResponsivePublicImage
      {...props}
      image={await resolveRequiredPublicImage(source, role)}
    />
  );
}
