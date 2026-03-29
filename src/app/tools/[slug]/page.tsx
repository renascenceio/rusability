import { INDUSTRY_TOOLS} from"@/lib/data";
import { notFound} from"next/navigation";
import ToolDetailClient from "@/components/ToolDetailClient";

export default async function ToolDetailPage(props: { params: Promise<{ slug: string}>}) {
 const { slug} = await props.params;
 const tool = INDUSTRY_TOOLS.find(t => t.link.includes(slug));

 if (!tool) {
 notFound();
}

 return <ToolDetailClient tool={tool} />;
}
