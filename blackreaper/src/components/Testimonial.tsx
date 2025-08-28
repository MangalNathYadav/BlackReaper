interface TestimonialProps {
  name: string;
  role: string;
  content: string;
  avatar?: string;
}

export default function Testimonial({ name, role, content, avatar }: TestimonialProps) {
  return (
    <div className="card p-6">
      <div className="flex items-center mb-4">
        <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-700 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
          {avatar || name.charAt(0)}
        </div>
        <div>
          <h4 className="font-bold">{name}</h4>
          <p className="text-sm opacity-70">{role}</p>
        </div>
      </div>
      <p className="italic opacity-80">"{content}"</p>
      <div className="flex text-yellow-400 mt-3">
        {'★'.repeat(5)}
      </div>
    </div>
  );
}
