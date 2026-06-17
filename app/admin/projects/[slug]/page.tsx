import { redirect } from 'next/navigation'

type Props = { params: Promise<{ slug: string }> }

export default async function ProjectAdminRoot({ params }: Props) {
  const { slug } = await params
  redirect(`/admin/projects/${slug}/overview`)
}
