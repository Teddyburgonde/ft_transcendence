export default function Myapp() {
	return (
		<div className="h-screen bg-blue-100 flex flex-col items-center justify-center px-4 text-center">
			<h1 className="text-5xl font-bold text-blue-800 mb-4">
			Bienvenue sur Pong !
			</h1>
			<p className="text-lg text-gray-700 mb-8 max-w-md">
			Défie tes amis en ligne dans le jeu classique Pong. Connecte-toi et prépare-toi à marquer l’histoire 🏓
			</p>
			<div className="flex flex-col sm:flex-row gap-4">
				<button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition">Se connecter</button>
 				<button className="bg-white text-blue-600 border border-blue-600 px-6 py-3 rounded-lg hover:bg-blue-50 transition">S’inscrire</button> 		
			</div>
		</div>
	)
}