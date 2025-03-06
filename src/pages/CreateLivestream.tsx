
import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useLivestreams } from '@/hooks/useLivestreams';
import { useAuth } from '@/context/AuthContext';
import { NavigationBar } from '@/components/ui/navigation-bar';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarIcon, ChevronLeft } from 'lucide-react';
import { format } from 'date-fns';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const createLivestreamSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  description: z.string().max(500).optional(),
  scheduledStart: z.date().min(new Date(), 'Date must be in the future'),
});

type CreateLivestreamData = z.infer<typeof createLivestreamSchema>;

const CreateLivestream = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { createLivestream } = useLivestreams();
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<CreateLivestreamData>({
    resolver: zodResolver(createLivestreamSchema),
    defaultValues: {
      scheduledStart: new Date(),
    },
  });
  
  const scheduledStart = watch('scheduledStart');

  const onSubmit = async (data: CreateLivestreamData) => {
    try {
      const result = await createLivestream.mutateAsync({
        title: data.title,
        description: data.description,
        scheduled_start: data.scheduledStart.toISOString(),
      });
      
      navigate(`/livestream/${result.id}`);
    } catch (error) {
      console.error('Error creating livestream:', error);
    }
  };

  if (!profile || profile.role !== 'organizer') {
    return (
      <div className="app-height bg-darkbg flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold text-white mb-4">Access Denied</h1>
        <p className="text-gray-400 mb-6 text-center">
          You need to be an organizer to create livestreams.
        </p>
        <Button asChild>
          <Link to="/livestreams">Go Back</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="app-height bg-darkbg flex flex-col">
      <div className="flex-1 overflow-y-auto scrollbar-none pb-16">
        {/* Header */}
        <div className="p-4 border-b border-gray-800 flex items-center gap-4">
          <Link to="/livestreams" className="text-white">
            <ChevronLeft className="h-6 w-6" />
          </Link>
          <h1 className="text-xl font-bold text-white">Create Livestream</h1>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="Enter livestream title"
              {...register('title')}
              className="bg-darkbg-lighter border-gray-800"
            />
            {errors.title && (
              <p className="text-sm text-red-500">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Enter livestream description"
              {...register('description')}
              className="bg-darkbg-lighter border-gray-800 min-h-[100px]"
            />
            {errors.description && (
              <p className="text-sm text-red-500">{errors.description.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Scheduled Start</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal bg-darkbg-lighter border-gray-800"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {scheduledStart ? format(scheduledStart, 'PPP') : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-darkbg-lighter border-gray-800">
                <Calendar
                  mode="single"
                  selected={scheduledStart}
                  onSelect={(date) => date && setValue('scheduledStart', date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            {errors.scheduledStart && (
              <p className="text-sm text-red-500">{errors.scheduledStart.message}</p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full bg-neon-yellow text-black hover:bg-neon-yellow/90"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black"></div>
            ) : (
              'Create Livestream'
            )}
          </Button>
        </form>
      </div>
      
      <NavigationBar />
    </div>
  );
};

export default CreateLivestream;
