import Head from "next/head"

export default function SEO({
    title = "XXX casino",
    description = "an online casino for cryptocurrency.",
    url = "http://localhost:3000",
}) {
    return (
        <Head>
            <title key="title">{title}</title>
            <link key="canonical" rel="canonical" href={url} />
            <meta name="description" content={description} />

            <meta name="og:type" property="og:type" content="website" />
            <meta name="og:url" property="og:url" content={url} />
            <meta name="og:description" property="og:description" content={description} />

            <meta name="twitter:dnt" content="on" />
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={title} />
            <meta name="twitter:description" content={description} />
        </Head>
    )
}
