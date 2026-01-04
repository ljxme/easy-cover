import Canvas from '@/components/cover/Canvas';
import Controls from '@/components/cover/Controls';

export default function Home() {
	return (
		<main className="flex flex-col-reverse md:flex-row h-screen w-full bg-background overflow-hidden">
			<Controls />
			<Canvas />
		</main>
	);
}
